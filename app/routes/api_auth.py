"""REST API Authentication Routes."""

from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app import db
from app.models import User
from app.auth import generate_tokens, revoke_token, get_current_user_id, user_to_dict

api_auth_bp = Blueprint('api_auth', __name__)


@api_auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user and return JWT tokens."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        full_name = data.get('full_name', '').strip()
        
        # Validation
        errors = []
        
        if not username or len(username) < 3:
            errors.append('Username must be at least 3 characters.')
        
        if not email or '@' not in email:
            errors.append('Please enter a valid email address.')
        
        if not password or len(password) < 6:
            errors.append('Password must be at least 6 characters.')
        
        # Check if user exists
        if User.query.filter_by(username=username).first():
            errors.append('Username is already taken.')
        
        if User.query.filter_by(email=email).first():
            errors.append('Email is already registered.')
        
        if errors:
            return jsonify({'errors': errors}), 400
        
        # Create user
        user = User(
            username=username,
            email=email,
            full_name=full_name or None
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # Generate tokens
        tokens = generate_tokens(
            user.id,
            additional_claims={'username': user.username}
        )
        
        return jsonify({
            'message': 'Registration successful',
            'user': user_to_dict(user),
            **tokens
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return JWT tokens."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        # Find user by username or email
        user = User.query.filter(
            (User.username == username) | (User.email == username)
        ).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid username or password'}), 401
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Generate tokens
        tokens = generate_tokens(
            user.id,
            additional_claims={'username': user.username}
        )
        
        return jsonify({
            'message': 'Login successful',
            'user': user_to_dict(user),
            **tokens
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user by revoking the current token."""
    try:
        jti = get_jwt()['jti']
        revoke_token(jti)
        
        return jsonify({'message': 'Successfully logged out'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user information."""
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


@api_auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    """Refresh access token using refresh token."""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        tokens = generate_tokens(
            user.id,
            additional_claims={'username': user.username}
        )
        
        return jsonify({
            'message': 'Token refreshed',
            **tokens
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
