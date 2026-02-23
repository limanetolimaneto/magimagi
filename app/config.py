from datetime import timedelta


class Config:
    """
    Base configuration class for the Flask application.
    All environment-specific configurations should extend or override this class.
    """

    # ======================================================
    # Database configuration
    # ======================================================

    # SQLAlchemy database connection string
    SQLALCHEMY_DATABASE_URI = "sqlite:///base.db"

    # Disable modification tracking to reduce overhead
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ======================================================
    # Frontend / CORS configuration
    # ======================================================

    # URL of the frontend application allowed to access this backend
    FRONTEND_URL = "https://"

    # ======================================================
    # JWT (Authentication) configuration
    # ======================================================

    # Secret key used to sign JWT tokens (use environment variables in production)
    JWT_SECRET_KEY = "minha_chave_super_secreta_para_dev123!"

    # Define where JWT tokens are read from (cookies in this case)
    JWT_TOKEN_LOCATION = ["cookies"]

    # Allow cookies to be sent only over HTTPS (should be True in production)
    JWT_COOKIE_SECURE = False

    # Path where the JWT access cookie is valid
    JWT_ACCESS_COOKIE_PATH = "/"

    # Enable or disable CSRF protection for JWT cookies
    # Recommended to enable in production environments
    JWT_COOKIE_CSRF_PROTECT = False

    # JWT access token expiration time
    # Examples: hours=1, minutes=30, days=1
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)

    # Node server settings
    NODE_PATH = '/home/limanetouser/punilissa/app/static/js/whatsapp/index.js'
    NODE_LOG = '/home/limanetouser/punilissa/app/static/js/whatsapp/node.log'
