import os
from datetime import timedelta


class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///flashcards.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # AI Configuration
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
    
    # Session configuration
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    SQLALCHEMY_ECHO = True


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    SQLALCHEMY_ECHO = False
    
    @staticmethod
    def init_app(app):
        """Production-specific initialization."""
        # Ensure SECRET_KEY is set in production
        if app.config['SECRET_KEY'] == 'dev-secret-key-change-in-production':
            raise ValueError("Please set a secure SECRET_KEY in production!")
        
        # Handle Railway's PostgreSQL DATABASE_URL
        # Railway provides postgres:// but SQLAlchemy requires postgresql://
        database_url = os.environ.get('DATABASE_URL')
        if database_url and database_url.startswith('postgres://'):
            database_url = database_url.replace('postgres://', 'postgresql://', 1)
            app.config['SQLALCHEMY_DATABASE_URI'] = database_url


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
