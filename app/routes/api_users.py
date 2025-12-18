"""REST API User Management Routes."""

from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models import User, Flashcard, Deck, TestResult
from app.auth import get_current_user_id, user_to_dict

api_users_bp = Blueprint('api_users', __name__)


@api_users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user's profile."""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': user_to_dict(user)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update current user's profile."""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if 'full_name' in data:
            user.full_name = data['full_name'].strip() or None
        
        if 'email' in data:
            new_email = data['email'].strip().lower()
            if new_email != user.email:
                # Check if email is already in use
                if User.query.filter_by(email=new_email).first():
                    return jsonify({'error': 'Email is already in use'}), 400
                user.email = new_email
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user_to_dict(user)
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_users_bp.route('/password', methods=['PUT'])
@jwt_required()
def change_password():
    """Change current user's password."""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')
        
        if not current_password or not new_password:
            return jsonify({
                'error': 'Current password and new password are required'
            }), 400
        
        if not user.check_password(current_password):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        if len(new_password) < 6:
            return jsonify({
                'error': 'New password must be at least 6 characters'
            }), 400
        
        user.set_password(new_password)
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_users_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    """Get dashboard statistics for current user."""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get overall statistics
        total_cards = Flashcard.query.count()
        total_decks = Deck.query.count()
        
        # Cards due for review
        due_cards = Flashcard.query.filter(
            (Flashcard.next_review <= datetime.utcnow()) | (Flashcard.next_review.is_(None))
        ).count()
        
        # Study progress
        cards_reviewed = Flashcard.query.filter(Flashcard.times_reviewed > 0).count()
        
        # Calculate mastery rate
        all_reviewed_cards = Flashcard.query.filter(Flashcard.times_reviewed > 0).all()
        if all_reviewed_cards:
            total_reviews = sum(c.times_reviewed for c in all_reviewed_cards)
            total_correct = sum(c.times_correct for c in all_reviewed_cards)
            mastery_rate = round((total_correct / total_reviews) * 100, 2) if total_reviews > 0 else 0
        else:
            mastery_rate = 0
        
        # Cards that are considered "mastered" (high interval)
        mastered_cards = Flashcard.query.filter(Flashcard.interval >= 21).count()
        
        # Recent test results
        recent_tests = TestResult.query.order_by(
            TestResult.completed_at.desc()
        ).limit(5).all()
        
        recent_tests_data = [{
            'id': test.id,
            'deck_name': test.deck.name if test.deck else 'All Decks',
            'score_percentage': test.score_percentage,
            'completed_at': test.completed_at.isoformat() if test.completed_at else None
        } for test in recent_tests]
        
        # Recent decks
        recent_decks = Deck.query.order_by(Deck.created_at.desc()).limit(5).all()
        recent_decks_data = [{
            'id': deck.id,
            'name': deck.name,
            'card_count': deck.card_count,
            'created_at': deck.created_at.isoformat() if deck.created_at else None
        } for deck in recent_decks]
        
        return jsonify({
            'user': {
                'username': user.username,
                'full_name': user.full_name,
                'last_login': user.last_login.isoformat() if user.last_login else None
            },
            'stats': {
                'total_cards': total_cards,
                'total_decks': total_decks,
                'due_cards': due_cards,
                'cards_reviewed': cards_reviewed,
                'mastered_cards': mastered_cards,
                'mastery_rate': mastery_rate
            },
            'recent_tests': recent_tests_data,
            'recent_decks': recent_decks_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_users_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    """Get detailed user statistics."""
    try:
        user_id = get_current_user_id()
        
        # Deck-by-deck statistics
        decks = Deck.query.all()
        deck_stats = []
        
        for deck in decks:
            cards = Flashcard.query.filter_by(deck_id=deck.id).all()
            
            if cards:
                total_reviews = sum(c.times_reviewed for c in cards)
                total_correct = sum(c.times_correct for c in cards)
                success_rate = round((total_correct / total_reviews) * 100, 2) if total_reviews > 0 else 0
                
                due_count = sum(1 for c in cards if c.next_review is None or c.next_review <= datetime.utcnow())
            else:
                success_rate = 0
                due_count = 0
            
            deck_stats.append({
                'id': deck.id,
                'name': deck.name,
                'card_count': deck.card_count,
                'due_count': due_count,
                'success_rate': success_rate
            })
        
        # Sort by due count (most urgent first)
        deck_stats.sort(key=lambda d: d['due_count'], reverse=True)
        
        # Overall test performance
        all_tests = TestResult.query.all()
        if all_tests:
            avg_score = round(sum(t.score_percentage for t in all_tests) / len(all_tests), 2)
            total_test_questions = sum(t.total_questions for t in all_tests)
            total_tests = len(all_tests)
        else:
            avg_score = 0
            total_test_questions = 0
            total_tests = 0
        
        return jsonify({
            'deck_stats': deck_stats,
            'test_performance': {
                'total_tests': total_tests,
                'average_score': avg_score,
                'total_questions_answered': total_test_questions
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
