"""JWT Authentication utilities for Flask REST API."""

from functools import wraps
from datetime import timedelta
from flask import jsonify
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
    get_jwt
)

jwt = JWTManager()

# Token blocklist for logout functionality
token_blocklist = set()


def init_jwt(app):
    """Initialize JWT with application configuration."""
    # JWT Configuration
    app.config.setdefault('JWT_SECRET_KEY', app.config.get('SECRET_KEY', 'super-secret-key-change-in-production'))
    app.config.setdefault('JWT_ACCESS_TOKEN_EXPIRES', timedelta(hours=1))
    app.config.setdefault('JWT_REFRESH_TOKEN_EXPIRES', timedelta(days=30))
    app.config.setdefault('JWT_TOKEN_LOCATION', ['headers'])
    app.config.setdefault('JWT_HEADER_NAME', 'Authorization')
    app.config.setdefault('JWT_HEADER_TYPE', 'Bearer')
    
    jwt.init_app(app)
    
    # Register token blocklist callback
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload['jti']
        return jti in token_blocklist
    
    # Custom error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'Token has expired',
            'code': 'token_expired'
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'error': 'Invalid token',
            'code': 'invalid_token'
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'error': 'Authorization token is missing',
            'code': 'missing_token'
        }), 401
    
    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'Token has been revoked',
            'code': 'token_revoked'
        }), 401
    
    return jwt


def generate_tokens(user_id, additional_claims=None):
    """Generate access and refresh tokens for a user."""
    claims = additional_claims or {}
    access_token = create_access_token(identity=str(user_id), additional_claims=claims)
    refresh_token = create_refresh_token(identity=str(user_id), additional_claims=claims)
    return {
        'access_token': access_token,
        'refresh_token': refresh_token
    }


def revoke_token(jti):
    """Add a token to the blocklist."""
    token_blocklist.add(jti)


def get_current_user_id():
    """Get the current user's ID from the JWT token."""
    identity = get_jwt_identity()
    return int(identity) if identity else None


def user_to_dict(user):
    """Convert a User model to a dictionary for API responses."""
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'full_name': user.full_name,
        'created_at': user.created_at.isoformat() if user.created_at else None,
        'last_login': user.last_login.isoformat() if user.last_login else None
    }
