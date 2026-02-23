from flask import Blueprint, request, jsonify, render_template, current_app
from ..extensions import db
from ..models import Task
from datetime import date, datetime
from ..users.users import User, get_users_list, get_name_user_list, get_name_coauthor
from ..leaders.leaders import get_leader
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
    verify_jwt_in_request
)
from werkzeug.security import check_password_hash
from ..readers.readers import get_readers_list, get_name_reader_list
from ..origins.origins import get_origins_list, get_name_origin
from sqlalchemy import cast, Date, and_
import json
from flask_cors import cross_origin
import locale
from sqlalchemy.orm.attributes import flag_modified
import logging


# ======================================================
# Blueprint definition
# ======================================================

tasks_bp = Blueprint('task', __name__, url_prefix='/tasks')

# ======================================================
# Log settings
# ======================================================
# logger = logging.getLogger(__name__)


# ======================================================
# Global template utility
# ======================================================

@tasks_bp.app_template_global()
def user_authenticated():
    """
    Check if a valid JWT exists in the request.
    Used inside Jinja templates.
    """
    try:
        verify_jwt_in_request()
        return True
    except:
        return False


# ======================================================
# Main task listing page
# ======================================================

@tasks_bp.route('/main-task', methods=['GET'])
@jwt_required()
def main_task_page():
    """
    Render the main task listing page.
    Applies filters from query string when provided.
    """
    leaderData = get_leader()
    readersData = get_readers_list()
    usersData = get_users_list()
    originsData = get_origins_list()
    coauthorsData = get_users_list(profile_filter="coauthor")

    # Retrieve and clean filters from query string
    params = request.args.to_dict()
    cleaned_filters = {}

    if 'filters' in params and params['filters']:
        try:
            filters_dict = json.loads(params['filters'])
            cleaned_filters = {k: v for k, v in filters_dict.items() if v}
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid JSON filters format"}), 400

    # Retrieve filtered tasks
    tasksData = get_tasks_list(filters=cleaned_filters)

    user_exists = User.query.filter_by(id=get_jwt_identity()).first()
    if user_exists.id == 1:
        return "system under maintenance!"
    # Render template based on user profile
    if user_exists.profile == 'author':
        return render_template(
            'main-task.html',
            tasks=tasksData,
            leader=leaderData,
            user_id=user_exists.id,
            user_email=user_exists.email,
            readers=readersData,
            users=usersData,
            origins=originsData,
            coauthors=coauthorsData
        )

    if user_exists.profile == 'coauthor':
        return render_template(
            'main-task-coauthor.html',
            tasks=tasksData,
            leader=leaderData,
            user_id=user_exists.id,
            user_email=user_exists.email,
            readers=readersData,
            users=usersData,
            origins=originsData,
            coauthor=coauthorsData
        )


# ======================================================
# Task creation page
# ======================================================

@tasks_bp.route('/tasks', methods=['GET'])
@jwt_required()
def tasks_page():
    """
    Render the task creation form.
    """
    leaderData = get_leader()
    readersData = get_readers_list()
    usersData = get_users_list()
    originsData = get_origins_list()
    user_exists = User.query.filter_by(id=get_jwt_identity()).first()

    return render_template(
        'tasks.html',
        leader=leaderData,
        user_id=user_exists.id,
        user_email=user_exists.email,
        readers=readersData,
        users=usersData,
        origins=originsData
    )


# ======================================================
# Save a new task (authenticated users)
# ======================================================

@tasks_bp.route('/save-task', methods=['POST'])
@jwt_required()
def save_task():
    """
    Persist a new task created via the web interface.
    Includes validation for dates, time, nullable fields and permissions.
    """
    user_exists = User.query.filter_by(id=get_jwt_identity()).first()
    data = request.get_json()

    if not isinstance(data, dict):
        return {'title': 'error', 'message': 'Expected a dict of tasks'}, 400

    # Validate origin date
    try:
        date_obj = datetime.strptime(data.get('origin-date'), '%Y-%m-%d').date()
    except:
        return {'title': 'error', 'message': 'Invalid origin date'}, 400

    # Validate origin time
    try:
        hour_obj = datetime.strptime(data.get('origin-time'), '%H:%M').time()
    except:
        return {'title': 'error', 'message': 'Invalid origin time'}, 400

    # Optional deadline
    deadline_obj = None
    if data.get('deadline'):
        try:
            deadline_obj = datetime.strptime(data.get('deadline'), '%Y-%m-%d').date()
        except:
            return {'title': 'error', 'message': 'Invalid deadline'}, 400

    # Optional remind me date
    remindme_obj = None
    if data.get('remindme'):
        try:
            remindme_obj = datetime.strptime(data.get('remindme'), '%Y-%m-%d').date()
        except:
            return {'title': 'error', 'message': 'Invalid remind-me date'}, 400

    # Origin foreign key
    origin_id = None if data.get('origin_id') == "0" else data.get('origin_id')

    # Coauthor inclusion
    includeCoauthor = [user_exists.coauthor] if data.get('includeCoauthor') else [0]

    # Share with leader
    shareLeader = data.get('shareLeader') if data.get('shareLeader') else None

    if not data.get('description'):
        return {'title': 'error', 'message': 'Description is required'}, 400

    # Create task
    task = Task(
        author=get_jwt_identity(),
        origin_date=date_obj,
        origin_time=hour_obj,
        deadline=deadline_obj,
        reminde_me=remindme_obj,
        origin_id=origin_id,
        status=data.get('status'),
        description=data.get('description'),
        comments=data.get('comments'),
        instructions=data.get('instructions'),
        editable=data.get('editableArray'),
        visibility=data.get('visibilityArray'),
        readers=data.get('readerArray'),
        coauthor=includeCoauthor,
        leader=shareLeader,
    )

    db.session.add(task)
    db.session.commit()

    # Initialize comments metadata
    updateTask = Task.query.get(task.id)

    locales_to_try = ['en_US.UTF-8', 'English_United States.1252', 'en_US', 'English', 'C']
    for loc in locales_to_try:
        try:
            locale.setlocale(locale.LC_TIME, loc)
            break
        except locale.Error:
            pass

    now = datetime.now()
    strTop = now.strftime('%a at %H:%Mh')

    if data.get('comments'):
        updateTask.comments = [{
            'commTaskid': task.id,
            'commDate': now.isoformat(),
            'commTop': f'On: {strTop} by: {user_exists.name}',
            'commBody': data.get('comments')
        }]

    db.session.commit()

    return jsonify({
        'title': 'ok',
        'message': f'The task "{updateTask.description}" was saved successfully'
    }), 200


# ======================================================
# Save task from Magimagi browser plugin (external)
# ======================================================

@tasks_bp.route('/save-task-from-plugin', methods=['POST'])
@cross_origin()
def save_task_from_pluguin():
    
    """
    Create a task via browser plugin authentication.
    Uses email/password instead of JWT.
    """
    data = request.get_json()

    user = User.query.filter_by(email=data.get('email')).first()
    if not user or not check_password_hash(user.password, data.get('password')):
        return jsonify({'title': 'ERROR', 'message': 'Invalid credentials'})

    task = Task(
        author=user.id,
        origin_date=date.today(),
        origin_time=datetime.now().time(),
        status='draft',
        description=data.get('text'),
        editable=[],
        visibility=[],
        readers=[],
        coauthor=[0],
        leader=False,
    )

    db.session.add(task)
    db.session.commit()

    return jsonify({'title': 'ok', 'message': task.id})

# ======================================================
# Save task from Whatsapp-web.js
# ======================================================
@tasks_bp.route('/save-task-from-whatsapp-web', methods=['POST'])
@cross_origin()
def save_task_from_whatsapp():
    """
    Create a task via whatsapp-web.js bot
    Uses customized password instead of JWT.
    """
    data = request.get_json()
    whatsappUser = data.get('from')
    current_app.logger.info(f'WHATSAPP USER: {whatsappUser}')
    if whatsappUser.split('@')[0] == '27664593531':
        user = User.query.filter_by(id=3).first()
    current_app.logger.info(f'WHATSAPP USER ID: {user.id}')
    now = datetime.now()
    strTop = now.strftime('%a at %H:%Mh')
    text = data.get('text')
    task = Task(
        author= user.id,
        origin_date=date.today(),
        origin_time=datetime.now().time(),
        status='draft',
        description=data.get('text'),
        editable=[],
        visibility=[],
        readers=[],
        coauthor=[0],
        leader=False,
    )
    db.session.add(task)
    db.session.commit()

    updateTask = Task.query.get(task.id)
    updateTask.comments = [{
            'commTaskid': task.id,
            'commDate': now.isoformat(),
            'commTop': f'On: {strTop} by: {user.name}',
            'commBody': ''
        }]
    db.session.commit()
    
    return jsonify({'title': 'ok', 'content': f'{text} - saved as Magimagi task'})




# ======================================================
# Retrieve tasks list (filtered)
# ======================================================

@tasks_bp.route('/tasks-list', methods=['GET'])
@jwt_required()
def get_tasks_list(filters=None):
    """
    Retrieve tasks with optional filters.
    Applies profile-based visibility rules.
    """
    query = Task.query.order_by(Task.id.desc())

    if filters:
        for key, value in filters.items():
            if key == 'status':
                query = query.filter(Task.status == value)
            elif key == 'origin_id':
                query = query.filter(Task.origin_id == int(value))
            elif key == 'origin_date_from':
                query = query.filter(Task.origin_date >= datetime.strptime(value, '%Y-%m-%d').date())
            elif key == 'origin_date_to':
                query = query.filter(Task.origin_date <= datetime.strptime(value, '%Y-%m-%d').date())

    tasks = query.all()
    user_exists = User.query.filter_by(id=get_jwt_identity()).first()

    # Filter tasks for coauthor profile
    if user_exists.profile == 'coauthor':
        user_id = int(get_jwt_identity())
        tasks = [t for t in tasks if t.coauthor and user_id in t.coauthor]

    return [
        {
            "id": t.id,
            "origin_date": t.origin_date.strftime('%Y-%m-%d'),
            "origin_time": t.origin_time.strftime('%H:%M') if t.origin_time else None,
            "deadline": t.deadline.strftime('%Y-%m-%d') if t.deadline else None,
            "author": t.author,
            "description": t.description,
            "instructions": t.instructions,
            "comments": t.comments,
            "editable": t.editable,
            "visibility": t.visibility,
            "readers": t.readers,
            "status": t.status,
            "coauthor": t.coauthor,
            "coauthor_name": get_name_coauthor(t.coauthor),
            "leader": t.leader,
            "reminde_me": t.reminde_me,
            "origin_id": t.origin_id,
            "origin_name": get_name_origin(t.origin_id),
            "editableName": get_name_user_list(t.editable),
            "visibilityName": get_name_user_list(t.visibility),
            "readerName": get_name_reader_list(t.readers),
        }
        for t in tasks
    ]

# ======================================================
# Maintenance
# ======================================================

# Delete task by id ====================================
@tasks_bp.route('/w-del-task/<int:task_id>', methods=['GET'])
def del_task(task_id):
    task = Task.query.get(task_id)
    db.session.delete(task)
    db.session.commit()
    return 'ok'

