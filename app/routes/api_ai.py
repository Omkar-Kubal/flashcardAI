"""REST API AI Routes for flashcard generation and answer evaluation."""

import requests
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
from app import db
from app.models import Flashcard, Deck
from app.services.ai_service import FlashcardGenerator
from app.services.evaluation_service import AnswerEvaluator

api_ai_bp = Blueprint('api_ai', __name__)

ALLOWED_EXTENSIONS = {'pdf'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@api_ai_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_flashcards():
    """Generate flashcards from text using AI."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        text = data.get('text', '').strip()
        card_type = data.get('card_type', 'mixed')
        difficulty = data.get('difficulty', 'intermediate')
        quantity = int(data.get('quantity', 10))
        focus_area = data.get('focus_area', 'key_concepts')
        
        if not text:
            return jsonify({'error': 'Source text is required'}), 400
        
        generator = FlashcardGenerator()
        flashcards = generator.generate_flashcards(
            text=text,
            card_type=card_type,
            difficulty=difficulty,
            quantity=quantity,
            focus_area=focus_area
        )
        
        return jsonify({
            'success': True,
            'flashcards': flashcards,
            'count': len(flashcards)
        })
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except RuntimeError as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        current_app.logger.error(f"AI generation error: {e}")
        return jsonify({'error': str(e)}), 500


@api_ai_bp.route('/evaluate', methods=['POST'])
@jwt_required()
def evaluate_answer():
    """Evaluate a student's answer using AI."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        question = data.get('question', '')
        expected_answer = data.get('expected_answer', '')
        student_answer = data.get('student_answer', '')
        card_type = data.get('card_type', 'qa')
        
        if not all([question, expected_answer, student_answer]):
            return jsonify({
                'error': 'Question, expected answer, and student answer are required'
            }), 400
        
        evaluator = AnswerEvaluator()
        result = evaluator.evaluate(
            question=question,
            expected_answer=expected_answer,
            student_answer=student_answer,
            card_type=card_type
        )
        
        return jsonify({
            'success': True,
            'score': result.score,
            'score_percentage': int(result.score * 100),
            'is_correct': result.is_correct,
            'partial_credit': result.partial_credit,
            'feedback': result.feedback,
            'model_answer': result.model_answer,
            'highlights': result.highlights
        })
        
    except Exception as e:
        current_app.logger.error(f"AI evaluation error: {e}")
        return jsonify({'error': str(e)}), 500


@api_ai_bp.route('/search-topic', methods=['POST'])
@jwt_required()
def search_topic():
    """Search Wikipedia for a topic and return summary."""
    try:
        data = request.get_json()
        topic = data.get('topic', '').strip()
        
        if not topic:
            return jsonify({'error': 'Topic is required'}), 400
        
        # Search Wikipedia API
        search_url = f'https://en.wikipedia.org/api/rest_v1/page/summary/{requests.utils.quote(topic)}'
        
        response = requests.get(search_url, timeout=10)
        
        if response.status_code == 404:
            return jsonify({'error': f'Topic "{topic}" not found on Wikipedia'}), 404
        
        response.raise_for_status()
        data = response.json()
        
        # Extract text content
        title = data.get('title', topic)
        extract = data.get('extract', '')
        
        if not extract:
            return jsonify({'error': 'No content found for this topic'}), 404
        
        # Limit to 5000 characters
        if len(extract) > 5000:
            extract = extract[:5000]
        
        return jsonify({
            'success': True,
            'title': title,
            'text': extract,
            'source': 'Wikipedia',
            'url': data.get('content_urls', {}).get('desktop', {}).get('page', '')
        })
        
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Search timed out. Please try again.'}), 504
    except requests.exceptions.RequestException as e:
        current_app.logger.error(f"Wikipedia search failed: {e}")
        return jsonify({'error': 'Failed to search Wikipedia'}), 500
    except Exception as e:
        current_app.logger.error(f"Topic search error: {e}")
        return jsonify({'error': str(e)}), 500


@api_ai_bp.route('/upload-pdf', methods=['POST'])
@jwt_required()
def upload_pdf():
    """Extract text from uploaded PDF file."""
    try:
        if 'pdf_file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['pdf_file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Only PDF files are allowed'}), 400
        
        # Check file size
        file.seek(0, 2)
        size = file.tell()
        file.seek(0)
        
        if size > MAX_FILE_SIZE:
            return jsonify({
                'error': f'File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB'
            }), 400
        
        # Extract text from PDF
        try:
            from PyPDF2 import PdfReader
            
            reader = PdfReader(file)
            text_content = []
            
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_content.append(page_text)
            
            extracted_text = '\n\n'.join(text_content)
            
            if not extracted_text.strip():
                return jsonify({
                    'error': 'Could not extract text from PDF. The file may be image-based or encrypted.'
                }), 400
            
            # Trim to 5000 chars max
            if len(extracted_text) > 5000:
                extracted_text = extracted_text[:5000]
            
            return jsonify({
                'success': True,
                'text': extracted_text,
                'pages': len(reader.pages),
                'chars': len(extracted_text)
            })
            
        except Exception as e:
            current_app.logger.error(f"PDF extraction failed: {e}")
            return jsonify({'error': f'Failed to read PDF: {str(e)}'}), 500
    
    except Exception as e:
        current_app.logger.error(f"PDF upload failed: {e}")
        return jsonify({'error': str(e)}), 500


@api_ai_bp.route('/save', methods=['POST'])
@jwt_required()
def save_flashcards():
    """Save generated flashcards to a deck."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        deck_id = data.get('deck_id')
        deck_name = data.get('deck_name', '').strip()
        flashcards_data = data.get('flashcards', [])
        
        if not flashcards_data:
            return jsonify({'error': 'No flashcards to save'}), 400
        
        # Create new deck if needed
        if deck_name and not deck_id:
            deck = Deck(name=deck_name, description='AI-generated deck')
            db.session.add(deck)
            db.session.flush()
            deck_id = deck.id
        
        # Save flashcards
        saved_count = 0
        for card_data in flashcards_data:
            flashcard = Flashcard(
                deck_id=deck_id,
                question=card_data.get('question', ''),
                answer=card_data.get('answer', ''),
                difficulty=_map_difficulty(card_data.get('difficulty', 'intermediate'))
            )
            db.session.add(flashcard)
            saved_count += 1
        
        # Update deck card count
        if deck_id:
            deck = Deck.query.get(deck_id)
            if deck:
                deck.card_count = Flashcard.query.filter_by(deck_id=deck_id).count()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'saved_count': saved_count,
            'deck_id': deck_id
        })
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Save flashcards error: {e}")
        return jsonify({'error': str(e)}), 500


def _map_difficulty(difficulty_str: str) -> int:
    """Map difficulty string to integer (1-5)."""
    mapping = {
        'beginner': 1,
        'easy': 2,
        'intermediate': 3,
        'advanced': 4,
        'expert': 5
    }
    return mapping.get(difficulty_str.lower(), 3)
