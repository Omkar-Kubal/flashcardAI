"""REST API Study Routes."""

import random
import re
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models import Flashcard, Deck, Student, TestResult
from app.auth import get_current_user_id

api_study_bp = Blueprint('api_study', __name__)


@api_study_bp.route('/session', methods=['GET'])
@jwt_required()
def start_study_session():
    """Start a study session and return flashcards to review."""
    try:
        deck_id = request.args.get('deck_id', type=int)
        adaptive = request.args.get('adaptive', 'true').lower() == 'true'
        limit = request.args.get('limit', 20, type=int)
        
        query = Flashcard.query
        
        if deck_id:
            query = query.filter_by(deck_id=deck_id)
        
        cards = query.all()
        
        if not cards:
            return jsonify({
                'error': 'No flashcards available',
                'flashcards': []
            }), 404
        
        # Use adaptive ordering (prioritize difficult cards) or random
        if adaptive:
            cards.sort(key=lambda card: card.priority_score, reverse=True)
        else:
            random.shuffle(cards)
        
        # Limit cards
        cards = cards[:limit]
        
        flashcards = [{
            'id': card.id,
            'question': card.question,
            'answer': card.answer,
            'difficulty': card.difficulty,
            'deck_id': card.deck_id,
            'deck_name': card.deck.name if card.deck else None,
            'times_reviewed': card.times_reviewed,
            'times_correct': card.times_correct
        } for card in cards]
        
        return jsonify({
            'session_id': datetime.utcnow().isoformat(),
            'flashcards': flashcards,
            'total': len(flashcards),
            'adaptive': adaptive
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_study_bp.route('/answer', methods=['POST'])
@jwt_required()
def submit_answer():
    """Submit an answer and update spaced repetition data."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        flashcard_id = data.get('flashcard_id')
        quality = data.get('quality', 3)  # 0-5 scale
        user_answer = data.get('user_answer', '')
        
        if not flashcard_id:
            return jsonify({'error': 'Flashcard ID is required'}), 400
        
        card = Flashcard.query.get(flashcard_id)
        
        if not card:
            return jsonify({'error': 'Flashcard not found'}), 404
        
        # Update spaced repetition
        card.update_spaced_repetition(quality)
        db.session.commit()
        
        # Determine if answer is correct (simple comparison)
        is_correct = quality >= 3
        
        # Optionally evaluate with AI if user_answer provided
        ai_feedback = None
        if user_answer:
            # Simple string comparison for now
            is_correct = user_answer.lower().strip() == card.answer.lower().strip()
        
        return jsonify({
            'success': True,
            'is_correct': is_correct,
            'quality': quality,
            'correct_answer': card.answer,
            'next_review': card.next_review.isoformat() if card.next_review else None,
            'interval': card.interval,
            'ai_feedback': ai_feedback
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_study_bp.route('/test/start', methods=['POST'])
@jwt_required()
def start_test():
    """Start a graded test session."""
    try:
        data = request.get_json()
        
        name = data.get('name', '').strip()
        roll_no = data.get('roll_no', '').strip()
        student_class = data.get('student_class', '').strip()
        deck_id = data.get('deck_id')
        
        # Validate roll number format
        if roll_no and not re.match(r'^R\d+$', roll_no):
            return jsonify({
                'error': 'Roll number should start with "R" followed by digits (e.g., R123)'
            }), 400
        
        # Find or create student
        student = None
        if roll_no:
            student = Student.query.filter_by(roll_no=roll_no).first()
            if not student:
                student = Student(name=name, roll_no=roll_no, student_class=student_class)
                db.session.add(student)
                db.session.commit()
        
        # Get cards for test
        query = Flashcard.query
        if deck_id:
            query = query.filter_by(deck_id=deck_id)
        
        cards = query.all()
        
        if not cards:
            return jsonify({
                'error': 'No flashcards available for testing'
            }), 404
        
        # Randomize questions
        random.shuffle(cards)
        
        questions = [{
            'id': card.id,
            'question': card.question,
            'deck_id': card.deck_id
        } for card in cards]
        
        return jsonify({
            'test_id': datetime.utcnow().isoformat(),
            'student_id': student.id if student else None,
            'deck_id': deck_id,
            'questions': questions,
            'total_questions': len(questions)
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_study_bp.route('/test/submit', methods=['POST'])
@jwt_required()
def submit_test():
    """Submit test answers and get results."""
    try:
        data = request.get_json()
        
        student_id = data.get('student_id')
        deck_id = data.get('deck_id')
        answers = data.get('answers', {})  # {flashcard_id: user_answer}
        time_taken = data.get('time_taken_seconds', 0)
        
        if not answers:
            return jsonify({'error': 'Answers are required'}), 400
        
        # Get flashcards
        card_ids = [int(id) for id in answers.keys()]
        cards = Flashcard.query.filter(Flashcard.id.in_(card_ids)).all()
        
        correct = 0
        wrong = 0
        results = []
        
        for card in cards:
            card_id_str = str(card.id)
            student_answer = answers.get(card_id_str, answers.get(card.id, '')).strip()
            is_correct = student_answer.lower() == card.answer.lower()
            
            if is_correct:
                correct += 1
            else:
                wrong += 1
            
            results.append({
                'question_id': card.id,
                'question': card.question,
                'correct_answer': card.answer,
                'student_answer': student_answer,
                'is_correct': is_correct
            })
        
        total = len(cards)
        score = round((correct / total) * 100, 2) if total > 0 else 0
        
        # Save test result
        if student_id:
            test_result = TestResult(
                student_id=student_id,
                deck_id=deck_id,
                total_questions=total,
                correct_answers=correct,
                wrong_answers=wrong,
                score_percentage=score,
                time_taken_seconds=time_taken
            )
            db.session.add(test_result)
            db.session.commit()
        
        return jsonify({
            'success': True,
            'score': score,
            'correct': correct,
            'wrong': wrong,
            'total': total,
            'time_taken': time_taken,
            'results': results
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_study_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_study_stats():
    """Get study statistics."""
    try:
        deck_id = request.args.get('deck_id', type=int)
        
        query = Flashcard.query
        if deck_id:
            query = query.filter_by(deck_id=deck_id)
        
        total_cards = query.count()
        
        # Cards due for review
        due_cards = query.filter(
            (Flashcard.next_review <= datetime.utcnow()) | (Flashcard.next_review.is_(None))
        ).count()
        
        # Cards that have been reviewed
        reviewed_cards = query.filter(Flashcard.times_reviewed > 0).count()
        
        # Average success rate
        cards_with_reviews = query.filter(Flashcard.times_reviewed > 0).all()
        if cards_with_reviews:
            total_reviews = sum(c.times_reviewed for c in cards_with_reviews)
            total_correct = sum(c.times_correct for c in cards_with_reviews)
            avg_success_rate = round((total_correct / total_reviews) * 100, 2) if total_reviews > 0 else 0
        else:
            avg_success_rate = 0
        
        # Get deck stats if deck_id provided
        deck_info = None
        if deck_id:
            deck = Deck.query.get(deck_id)
            if deck:
                deck_info = {
                    'id': deck.id,
                    'name': deck.name,
                    'card_count': deck.card_count
                }
        
        return jsonify({
            'total_cards': total_cards,
            'due_cards': due_cards,
            'reviewed_cards': reviewed_cards,
            'mastered_cards': query.filter(Flashcard.interval >= 21).count(),
            'avg_success_rate': avg_success_rate,
            'deck': deck_info
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_study_bp.route('/reports', methods=['GET'])
@jwt_required()
def get_reports():
    """Get test reports."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        student_id = request.args.get('student_id', type=int)
        
        query = TestResult.query
        
        if student_id:
            query = query.filter_by(student_id=student_id)
        
        pagination = query.order_by(TestResult.completed_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        results = [{
            'id': result.id,
            'student_id': result.student_id,
            'student_name': result.student.name if result.student else None,
            'deck_id': result.deck_id,
            'deck_name': result.deck.name if result.deck else None,
            'total_questions': result.total_questions,
            'correct_answers': result.correct_answers,
            'wrong_answers': result.wrong_answers,
            'score_percentage': result.score_percentage,
            'time_taken_seconds': result.time_taken_seconds,
            'completed_at': result.completed_at.isoformat() if result.completed_at else None
        } for result in pagination.items]
        
        return jsonify({
            'results': results,
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': pagination.page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
