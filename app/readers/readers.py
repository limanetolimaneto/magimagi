from flask import Blueprint, jsonify, render_template, request
from ..extensions import db
from ..models import Reader
from faker import Faker
import random


# ======================================================
# Blueprint & utilities
# ======================================================

# Faker instance used to generate fake readers (development only)
fake = Faker()

# Readers blueprint
readers_bp = Blueprint('reader', __name__, url_prefix='/readers')


# ======================================================
# Pages
# ======================================================

@readers_bp.route('/readers-page')
def new_reader_page():
    """
    Render the readers management page.
    """
    readerData = Reader.query.all()
    return render_template(
        'new-reader.html',
        readers=readerData
    )


# ======================================================
# Create reader
# ======================================================

@readers_bp.route('/new-reader-save', methods=['POST'])
def new_reader():
    """
    Save a new reader in the database.
    """
    data = request.get_json()

    reader = Reader(
        description=data.get("description"),
        email=data.get("email"),
        notes=data.get("notes"),
    )

    db.session.add(reader)
    db.session.commit()

    return jsonify({'title': 'ok'}), 200


# ======================================================
# Readers listing
# ======================================================

@readers_bp.route('/readers-list')
def get_readers_list():
    """
    Retrieve a list of all readers.
    """
    readers = Reader.query.all()

    return [
        {
            "id": r.id,
            "description": r.description,
            "email": r.email,
            "notes": r.notes,
        }
        for r in readers
    ]


@readers_bp.route("/readers-json")
def get_readers_json():
    """
    Return the readers list as JSON.
    """
    return jsonify(get_readers_list())


# ======================================================
# Development / test utilities
# ======================================================

@readers_bp.route('/fake-reader', methods=['GET'])
def fake_reader():
    """
    Create a fake reader using Faker (development only).
    """
    reader = Reader(
        description=fake.name(),
        email=fake.email(),
        notes=fake.sentence()
    )

    db.session.add(reader)
    db.session.commit()

    return reader.email


# ======================================================
# Utility functions
# ======================================================

@readers_bp.route('/get-name', methods=['GET'])
def get_name_reader(readerId):
    """
    Retrieve a reader description by ID.
    """
    return db.session.query(Reader.description).filter_by(id=readerId).scalar()


@readers_bp.route('/get-name-list', methods=['GET'])
def get_name_reader_list(readerIdList):
    """
    Retrieve a list of reader descriptions based on a list of IDs.
    """
    readerNameListResp = []

    for r in readerIdList:
        readerNameListResp.append(
            db.session.query(Reader.description).filter_by(id=r).scalar()
        )

    return readerNameListResp
