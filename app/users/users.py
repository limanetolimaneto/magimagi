from flask import (
    Blueprint,
    request,
    jsonify,
    render_template,
    url_for,
    redirect,
    current_app,
    make_response
)

from ..models import User
from ..extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from flask_cors import cross_origin

from ..leaders.leaders import get_leader
# from faker import Faker

# ======================================================
# Blueprint & utilities
# ======================================================


# Faker instance for generating test users
# fake = Faker()

# Users blueprint with URL prefix
users_bp = Blueprint('users', __name__, url_prefix='/users')

# ======================================================
# Root endpoint 
# ======================================================

@users_bp.route('/')
def loginPage():
    """
    Render the login page.
    """
    return render_template('login.html')

# ======================================================
# Authentication (Sign in / Sign up) + logout
# ======================================================

@users_bp.route('/signin', methods=['POST'])
@cross_origin()
def loginSingIn():
    """
    Authenticate a user using email and password.
    If successful, a JWT access token is stored in an HTTP-only cookie.
    """
    data = request.get_json()

    user_exists = User.query.filter_by(email=data.get('email')).first()
    if not user_exists:
        return jsonify({"error": "User doesn't exist"})

    if not check_password_hash(user_exists.password, data.get('password')):
        return jsonify({"error": "Password doesn't match"})

    # Create JWT token using user ID as identity
    access_token = create_access_token(identity=str(user_exists.id))

    # Create response and attach JWT as cookie
    resp = make_response(
        jsonify({
            "success": True,
            "redirect_url": "/tasks/main-task",
            "profile": user_exists.profile
        })
    )

    # Replace any existing access token cookie
    resp.delete_cookie('access_token_cookie', path='/')
    resp.set_cookie(
        'access_token_cookie',
        access_token,
        httponly=True,
        path='/'
    )

    return resp


@users_bp.route('/signup', methods=['POST'])
def loginSignUp():
    """
    Register a new user in the database.
    """
    data = request.get_json()

    if not isinstance(data, dict):
        return {"error": "Expected a dict of users"}, 400

    # Validate coauthor only for authors
    coauthorValid = None
    if data.get('coauthor') is not None and data.get('profile') == 'author':
        coauthorValid = data.get('coauthor')

    user = User(
        name=data.get('name'),
        email=data.get('email'),
        profile=data.get('profile'),
        password=generate_password_hash(data.get('password')),
        coauthor=coauthorValid
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({'title': 'ok'}), 200

@users_bp.route('/logout', methods=['POST'])
def logout():
    resp = make_response(
        jsonify({
            "success": True,
            "message": "Logged out successfully"
        })
    )

    # Remove o cookie do JWT
    resp.delete_cookie(
        'access_token_cookie',
        path='/'
    )

    return resp

# ======================================================
# Users listing (internal / JSON)
# ======================================================

@users_bp.route('/users-list', methods=['GET'])
def get_users_list(profile_filter=None):
    """
    Retrieve a list of users.
    Optionally filters users by profile.
    """
    query = User.query

    if profile_filter:
        query = query.filter_by(profile=profile_filter)

    users = query.all()

    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "password": u.password,
            "profile": u.profile,
            "coauthor": u.coauthor,
        }
        for u in users
    ]


@users_bp.route("/users-json")
def get_users_json():
    """
    Return the users list as JSON.
    """
    return jsonify(get_users_list())


# ======================================================
# User update
# ======================================================
@users_bp.route('/user-page', methods=['GET'])
@jwt_required()
def new_user_page():
    """
    Render the users page.
    Requires a valid JWT authentication.
    """
    usersData = User.query.all()
    user_exists = User.query.filter_by(id=get_jwt_identity()).first()

    return render_template(
        'users.html',
        users=usersData,
        user=user_exists
    )


# ======================================================
# User update
# ======================================================

@users_bp.route('/user-update', methods=['PUT'])
def update_user():
    """
    Update an existing user.
    Only provided fields are updated.
    """
    data = request.get_json()

    if not isinstance(data, dict):
        return {"error": "Expected a dict of users"}, 400

    coauthorValid = None
    if data.get('coauthor') is not None and data.get('profile') == 'author':
        coauthorValid = data.get('coauthor')

    user = User.query.get(data.get('id'))

    if data.get('name'):
        user.name = data.get('name')
    if data.get('email'):
        user.email = data.get('email')
    if data.get('password'):
        user.password = generate_password_hash(data.get('password'))
    if data.get('profile'):
        user.profile = data.get('profile')
    if data.get('coauthor'):
        user.coauthor = coauthorValid

    db.session.commit()
    return jsonify({'title': 'ok'}), 200








# ======================================================
# Utility functions
# ======================================================

@users_bp.route('/get-name', methods=['GET'])
def get_name_user(userId):
    """
    Retrieve a user's name by ID.
    """
    return db.session.query(User.name).filter_by(id=userId).scalar()


@users_bp.route('/get-name-list', methods=['GET'])
def get_name_user_list(userIdList):
    """
    Retrieve a list of user names based on a list of IDs.
    """
    userNameListResp = []

    for u in userIdList:
        userNameListResp.append(
            db.session.query(User.name).filter_by(id=u).scalar()
        )

    return userNameListResp


@users_bp.route('/leader-page')
@jwt_required()
def leader_page():
    """
    Render the leader page.
    Requires authentication.
    """
    leaderData = get_leader()
    usersData = User.query.all()

    return render_template(
        'leader.html',
        users=usersData,
        leader=leaderData
    )


def get_name_coauthor(idCoauthorJson):
    """
    Retrieve coauthor names from a list of IDs.
    """
    coauthor_name = []

    if idCoauthorJson[0] == 0:
        coauthor_name.append(None)
        return coauthor_name

    for co in idCoauthorJson:
        coauthor_name.append(
            db.session.query(User.name).filter_by(id=co).scalar()
        )

    return coauthor_name







# ======================================================
# Development / test users
# ======================================================

# @users_bp.route('/fake-user', methods=['GET'])
# def fake_user():
#     """
#     Create a fake user using Faker (development only).
#     """
#     user = User(
#         name=fake.name(),
#         email=fake.email(),
#         profile="author",
#         password="123",
#         coauthor=7
#     )

#     db.session.add(user)
#     db.session.commit()

#     return user.email

# @users_bp.route('/flask-user', methods=['GET'])
# def flask_user():
#     """
#     Create a static test user (development only).
#     """
#     user = User(
#         name='flask',
#         email='flask@email.com',
#         profile="author",
#         password=generate_password_hash('123'),
#     )

#     db.session.add(user)
#     # db.session.commit()

#     return user.email

# @users_bp.route('/admin-user', methods=['GET'])
# def admin_user():
#     """
#     Create admin and coauthor test users (development only).
#     """
#     user = User(
#         name='admin',
#         email='admin@email.com',
#         profile="author",
#         password=generate_password_hash('123'),
#         coauthor=2
#     )

#     db.session.add(user)
#     # db.session.commit()

#     user = User(
#         name='coauthor',
#         email='coauthor@email.com',
#         profile="coauthor",
#         password=generate_password_hash('123'),
#         coauthor=None
#     )

#     db.session.add(user)
#     # db.session.commit()

#     return user.email
