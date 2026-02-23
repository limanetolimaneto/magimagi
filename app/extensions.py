from flask_sqlalchemy import SQLAlchemy

# ======================================================
# Extensions initialization
# ======================================================

# SQLAlchemy database instance
# This object will be initialized with the Flask app
# inside the application factory (create_app)
db = SQLAlchemy()
