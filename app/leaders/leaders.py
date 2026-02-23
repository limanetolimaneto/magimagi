from flask import Blueprint, current_app, request, jsonify, render_template
from ..models import User
from flask_jwt_extended import jwt_required, get_jwt_identity
import os, json

# ======================================================
# Blueprint
# ======================================================

leaders_bp = Blueprint('leader', __name__, url_prefix='/leader')


# ======================================================
# Pages
# ======================================================

@leaders_bp.route('/settings-page', methods=['GET'])
@jwt_required()
def setting_page():
    """
    Render the settings page for the logged-in user.
    """
    userData = User.query.filter_by(id=get_jwt_identity()).first()
    return render_template('settings.html', user=userData, user_email = userData.email )



# ======================================================
# Leader management
# ======================================================

@leaders_bp.route('/new-leader-set', methods=['POST'])
def new_leader():
    """
    Set a new leader using the email provided in the request JSON.
    """
    data = request.get_json()
    email = data.get('email')
    set_leader(email)
    return jsonify({'title': 'ok', 'newLeader': email}), 200


@leaders_bp.route('/leader', methods=['GET'])
def get_leader():
    """
    Retrieve the current leader's email from leader.json file.
    """
    file_path = os.path.join(current_app.instance_path, 'leader.json')
    with open(file_path, 'r') as f:
        data = json.load(f)
    return data['leader_email']


@leaders_bp.route('/set-leader', methods=['GET'])
def set_leader(newEmail):
    """
    Update the leader email in the leader.json file.
    """
    file_path = os.path.join(current_app.instance_path, 'leader.json')
    with open(file_path, 'r') as f:
        data = json.load(f)

    data['leader_email'] = newEmail

    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)

    return data['leader_email']
