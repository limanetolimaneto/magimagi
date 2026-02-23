# Import blueprints for each application module
from app.users.users import users_bp
from app.tasks.tasks import tasks_bp
from app.leaders.leaders import leaders_bp
from app.readers.readers import readers_bp
from app.origins.origins import origins_bp
from app.doc.doc import doc_bp
from app.public.public import public_bp


def register_blueprints(app):
    """
    Register all application blueprints.

    Each blueprint represents a functional module of the system,
    helping to keep routes organized, modular, and maintainable.
    """

    # User management routes (authentication, profiles, etc.)
    app.register_blueprint(users_bp)

    # Task-related routes (creation, updates, status changes)
    app.register_blueprint(tasks_bp)

    # Leader-related routes (permissions, hierarchy, ownership)
    app.register_blueprint(leaders_bp)

    # Reader-related routes (read-only access or permissions)
    app.register_blueprint(readers_bp)

    # Origin-related routes (data sources, metadata, provenance)
    app.register_blueprint(origins_bp)

    # Documentation and utility routes
    app.register_blueprint(doc_bp)

    # Home page and public routes
    app.register_blueprint(public_bp)
