from flask import Blueprint, jsonify, render_template, request
from ..extensions import db
from ..models import Origin
from faker import Faker
from flask_jwt_extended import jwt_required

# ======================================================
# Blueprint & utilities
# ======================================================

fake = Faker()

origins_bp = Blueprint('origin', __name__, url_prefix='/origins')


# ======================================================
# Pages
# ======================================================

@origins_bp.route('/new-origin-page')
def new_origin_page():
    """
    Render the page to manage origins.
    """
    originData = Origin.query.all()
    return render_template('new-origin.html', origins=originData)


# ======================================================
# Create origin
# ======================================================

@origins_bp.route('/new-origin-save', methods=['POST'])
def new_origin_save():
    """
    Save a new origin in the database.
    """
    data = request.get_json()

    origin = Origin(
        description=data.get('description'),
        email=data.get('email'),
        type=data.get('type'),
        notes=data.get('notes'),
    )

    db.session.add(origin)
    db.session.commit()

    return jsonify({'title': 'ok'}), 200


# ======================================================
# Origins listing
# ======================================================

@origins_bp.route('/origins-list')
def get_origins_list():
    """
    Retrieve a list of all origins.
    """
    origin = Origin.query.all()
    return [
        {
            "id": o.id,
            "description": o.description,
            "email": o.email,
            "type": o.type,
            "notes": o.notes,
        } for o in origin
    ]


@origins_bp.route("/origins-json")
def get_origins_json():
    """
    Return the list of origins as JSON.
    """
    return jsonify(get_origins_list())


# ======================================================
# Development / test utilities
# ======================================================

@origins_bp.route('/fake-origin', methods=['GET'])
def fake_origin():
    """
    Create a fake origin using Faker (development only).
    """
    origin = Origin(
        description=fake.name(),
        email=fake.email(),
        notes=fake.sentence(),
        type=fake.word()
    )

    db.session.add(origin)
    db.session.commit()

    return origin.email


# ======================================================
# Utility functions
# ======================================================

@origins_bp.route('/get-name', methods=['GET'])
def get_name_origin(originId):
    """
    Retrieve an origin description by ID.
    """
    return db.session.query(Origin.description).filter_by(id=originId).scalar()
