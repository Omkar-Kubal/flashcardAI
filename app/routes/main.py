from flask import Blueprint, jsonify

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def index():
    """API root - returns basic info (frontend is Next.js)."""
    return jsonify({
        'message': 'BrainDeck API',
        'version': '1.0',
        'status': 'running',
        'endpoints': '/api'
    })
