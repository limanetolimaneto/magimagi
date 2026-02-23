from flask import Flask
from flask_cors import CORS
from app.routes import register_blueprints
from .extensions import db
from flask_jwt_extended import JWTManager
from app.public.public import format_date
import logging

def create_app():
    """
    Application factory function.
    Creates, configures, and returns the Flask application instance.
    This pattern allows better scalability and testing.
    """

    # Create the Flask application instance
    app = Flask(__name__)

    # Register a custom Jinja2 filter to format datetime objects in templates
    app.jinja_env.filters['datetimeformat'] = format_date

    # Load application configuration from the Config class
    app.config.from_object("app.config.Config")

    # Frontend URL allowed to communicate with this backend (CORS policy)
    frontend_url = app.config["FRONTEND_URL"]

    # Enable CORS (Cross-Origin Resource Sharing)
    # This allows the frontend to make authenticated requests (cookies / JWT)
    CORS(
        app,
        resources={r"/*": {"origins": frontend_url}},
        supports_credentials=True,  # Essential to allow cookies and auth headers
        methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allow_headers=['Content-Type', 'Authorization', 'Set-Cookie'],
    )

    # Register all application blueprints (routes grouped by feature)
    register_blueprints(app)

    # Initialize JWT authentication
    JWTManager(app)

    # Initialize database connection with the app context
    db.init_app(app)


    logging.basicConfig(level=logging.INFO)
    app.logger.setLevel(logging.INFO)

    # Return the fully configured Flask application
    return app
