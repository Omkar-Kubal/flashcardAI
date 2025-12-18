from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_cors import CORS
from app.config import config

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()


def create_app(config_name='default'):
    """Application factory pattern."""
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Initialize CORS for REST API
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": False
        }
    })
    
    # Initialize JWT Authentication
    from app.auth import init_jwt
    init_jwt(app)
    
    # Initialize Flask-Login (kept for backward compatibility during transition)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    login_manager.login_message_category = 'info'
    
    @login_manager.user_loader
    def load_user(user_id):
        from app.models import User
        return User.query.get(int(user_id))
    
    # Register blueprints - Template-based routes (legacy)
    from app.routes.main import main_bp
    from app.routes.flashcards import flashcards_bp
    from app.routes.study import study_bp
    from app.routes.api import api_bp
    from app.routes.ai import ai_bp
    from app.routes.auth import auth_bp
    
    app.register_blueprint(main_bp)
    app.register_blueprint(flashcards_bp, url_prefix='/flashcards')
    app.register_blueprint(study_bp, url_prefix='/study')
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(ai_bp)
    app.register_blueprint(auth_bp)
    
    # Register REST API blueprints
    from app.routes.api_auth import api_auth_bp
    from app.routes.api_flashcards import api_flashcards_bp
    from app.routes.api_study import api_study_bp
    from app.routes.api_ai import api_ai_bp
    from app.routes.api_users import api_users_bp
    
    app.register_blueprint(api_auth_bp, url_prefix='/api/auth')
    app.register_blueprint(api_flashcards_bp, url_prefix='/api/flashcards')
    app.register_blueprint(api_study_bp, url_prefix='/api/study')
    app.register_blueprint(api_ai_bp, url_prefix='/api/ai')
    app.register_blueprint(api_users_bp, url_prefix='/api/users')
    
    # Custom Jinja2 filters for timezone
    from datetime import timedelta
    
    @app.template_filter('to_ist')
    def to_ist_filter(dt):
        """Convert UTC datetime to IST (UTC+5:30)."""
        if dt is None:
            return ''
        ist_offset = timedelta(hours=5, minutes=30)
        return dt + ist_offset
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app

