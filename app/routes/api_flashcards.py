"""REST API Flashcard and Deck Routes."""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models import Flashcard, Deck
from app.auth import get_current_user_id

api_flashcards_bp = Blueprint('api_flashcards', __name__)


# ============== FLASHCARD ENDPOINTS ==============

@api_flashcards_bp.route('', methods=['GET'])
@jwt_required()
def list_flashcards():
    """List all flashcards with optional deck filter."""
    try:
        deck_id = request.args.get('deck_id', type=int)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        query = Flashcard.query
        
        if deck_id:
            query = query.filter_by(deck_id=deck_id)
        
        # Paginate results
        pagination = query.order_by(Flashcard.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        flashcards = [{
            'id': card.id,
            'question': card.question,
            'answer': card.answer,
            'deck_id': card.deck_id,
            'deck_name': card.deck.name if card.deck else None,
            'difficulty': card.difficulty,
            'times_reviewed': card.times_reviewed,
            'times_correct': card.times_correct,
            'created_at': card.created_at.isoformat() if card.created_at else None
        } for card in pagination.items]
        
        return jsonify({
            'flashcards': flashcards,
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': pagination.page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_flashcards_bp.route('', methods=['POST'])
@jwt_required()
def create_flashcard():
    """Create a new flashcard."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        question = data.get('question', '').strip()
        answer = data.get('answer', '').strip()
        deck_id = data.get('deck_id')
        difficulty = data.get('difficulty', 3)
        
        if not question or not answer:
            return jsonify({'error': 'Question and answer are required'}), 400
        
        flashcard = Flashcard(
            question=question,
            answer=answer,
            deck_id=deck_id,
            difficulty=difficulty
        )
        db.session.add(flashcard)
        
        # Update deck card count
        if deck_id:
            deck = Deck.query.get(deck_id)
            if deck:
                deck.card_count = Flashcard.query.filter_by(deck_id=deck_id).count() + 1
        
        db.session.commit()
        
        return jsonify({
            'message': 'Flashcard created successfully',
            'flashcard': {
                'id': flashcard.id,
                'question': flashcard.question,
                'answer': flashcard.answer,
                'deck_id': flashcard.deck_id,
                'difficulty': flashcard.difficulty,
                'created_at': flashcard.created_at.isoformat() if flashcard.created_at else None
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_flashcards_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_flashcard(id):
    """Get a single flashcard by ID."""
    try:
        flashcard = Flashcard.query.get(id)
        
        if not flashcard:
            return jsonify({'error': 'Flashcard not found'}), 404
        
        return jsonify({
            'flashcard': {
                'id': flashcard.id,
                'question': flashcard.question,
                'answer': flashcard.answer,
                'deck_id': flashcard.deck_id,
                'deck_name': flashcard.deck.name if flashcard.deck else None,
                'difficulty': flashcard.difficulty,
                'times_reviewed': flashcard.times_reviewed,
                'times_correct': flashcard.times_correct,
                'easiness_factor': flashcard.easiness_factor,
                'interval': flashcard.interval,
                'next_review': flashcard.next_review.isoformat() if flashcard.next_review else None,
                'created_at': flashcard.created_at.isoformat() if flashcard.created_at else None
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_flashcards_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_flashcard(id):
    """Update an existing flashcard."""
    try:
        flashcard = Flashcard.query.get(id)
        
        if not flashcard:
            return jsonify({'error': 'Flashcard not found'}), 404
        
        data = request.get_json()
        
        if 'question' in data:
            flashcard.question = data['question'].strip()
        if 'answer' in data:
            flashcard.answer = data['answer'].strip()
        if 'deck_id' in data:
            old_deck_id = flashcard.deck_id
            flashcard.deck_id = data['deck_id']
            
            # Update card counts
            if old_deck_id:
                old_deck = Deck.query.get(old_deck_id)
                if old_deck:
                    old_deck.card_count = max(0, Flashcard.query.filter_by(deck_id=old_deck_id).count() - 1)
            if data['deck_id']:
                new_deck = Deck.query.get(data['deck_id'])
                if new_deck:
                    new_deck.card_count = Flashcard.query.filter_by(deck_id=data['deck_id']).count() + 1
        
        if 'difficulty' in data:
            flashcard.difficulty = data['difficulty']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Flashcard updated successfully',
            'flashcard': {
                'id': flashcard.id,
                'question': flashcard.question,
                'answer': flashcard.answer,
                'deck_id': flashcard.deck_id,
                'difficulty': flashcard.difficulty
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_flashcards_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_flashcard(id):
    """Delete a flashcard."""
    try:
        flashcard = Flashcard.query.get(id)
        
        if not flashcard:
            return jsonify({'error': 'Flashcard not found'}), 404
        
        deck_id = flashcard.deck_id
        
        db.session.delete(flashcard)
        
        # Update deck card count
        if deck_id:
            deck = Deck.query.get(deck_id)
            if deck:
                deck.card_count = max(0, Flashcard.query.filter_by(deck_id=deck_id).count() - 1)
        
        db.session.commit()
        
        return jsonify({'message': 'Flashcard deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ============== DECK ENDPOINTS ==============

@api_flashcards_bp.route('/decks', methods=['GET'])
@jwt_required()
def list_decks():
    """List all decks with hierarchical structure."""
    try:
        parent_id = request.args.get('parent_id', type=int)
        
        if parent_id:
            # Get sub-decks of a parent
            decks = Deck.query.filter_by(parent_id=parent_id).order_by(Deck.name).all()
            parent_deck = Deck.query.get(parent_id)
            breadcrumb = parent_deck.get_breadcrumb() if parent_deck else []
        else:
            # Get root-level decks only
            decks = Deck.query.filter_by(parent_id=None).order_by(Deck.name).all()
            parent_deck = None
            breadcrumb = []
        
        decks_data = [{
            'id': deck.id,
            'name': deck.name,
            'description': deck.description,
            'parent_id': deck.parent_id,
            'card_count': deck.card_count,
            'children_count': len(deck.children) if hasattr(deck, 'children') else 0,
            'created_at': deck.created_at.isoformat() if deck.created_at else None
        } for deck in decks]
        
        return jsonify({
            'decks': decks_data,
            'parent_deck': {
                'id': parent_deck.id,
                'name': parent_deck.name
            } if parent_deck else None,
            'breadcrumb': [{'id': d.id, 'name': d.name} for d in breadcrumb]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_flashcards_bp.route('/decks', methods=['POST'])
@jwt_required()
def create_deck():
    """Create a new deck."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        name = data.get('name', '').strip()
        description = data.get('description', '').strip()
        parent_id = data.get('parent_id')
        
        if not name:
            return jsonify({'error': 'Deck name is required'}), 400
        
        deck = Deck(
            name=name,
            description=description,
            parent_id=parent_id
        )
        
        db.session.add(deck)
        db.session.commit()
        
        return jsonify({
            'message': 'Deck created successfully',
            'deck': {
                'id': deck.id,
                'name': deck.name,
                'description': deck.description,
                'parent_id': deck.parent_id,
                'card_count': deck.card_count,
                'created_at': deck.created_at.isoformat() if deck.created_at else None
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_flashcards_bp.route('/decks/<int:id>', methods=['GET'])
@jwt_required()
def get_deck(id):
    """Get a single deck with its flashcards."""
    try:
        deck = Deck.query.get(id)
        
        if not deck:
            return jsonify({'error': 'Deck not found'}), 404
        
        flashcards = [{
            'id': card.id,
            'question': card.question,
            'answer': card.answer,
            'difficulty': card.difficulty,
            'times_reviewed': card.times_reviewed,
            'times_correct': card.times_correct
        } for card in deck.flashcards]
        
        children = [{
            'id': child.id,
            'name': child.name,
            'card_count': child.card_count
        } for child in deck.children]
        
        return jsonify({
            'deck': {
                'id': deck.id,
                'name': deck.name,
                'description': deck.description,
                'parent_id': deck.parent_id,
                'card_count': deck.card_count,
                'created_at': deck.created_at.isoformat() if deck.created_at else None
            },
            'flashcards': flashcards,
            'children': children,
            'breadcrumb': [{'id': d.id, 'name': d.name} for d in deck.get_breadcrumb()]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_flashcards_bp.route('/decks/<int:id>', methods=['PUT'])
@jwt_required()
def update_deck(id):
    """Update an existing deck."""
    try:
        deck = Deck.query.get(id)
        
        if not deck:
            return jsonify({'error': 'Deck not found'}), 404
        
        data = request.get_json()
        
        if 'name' in data:
            deck.name = data['name'].strip()
        if 'description' in data:
            deck.description = data['description'].strip()
        if 'parent_id' in data:
            deck.parent_id = data['parent_id']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Deck updated successfully',
            'deck': {
                'id': deck.id,
                'name': deck.name,
                'description': deck.description,
                'parent_id': deck.parent_id
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_flashcards_bp.route('/decks/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_deck(id):
    """Delete a deck and all its flashcards and sub-decks."""
    try:
        deck = Deck.query.get(id)
        
        if not deck:
            return jsonify({'error': 'Deck not found'}), 404
        
        # Delete will cascade to flashcards and children
        db.session.delete(deck)
        db.session.commit()
        
        return jsonify({'message': 'Deck deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
