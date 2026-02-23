from flask import Blueprint, current_app, render_template
from ..extensions import db
from ..models import User
from datetime import datetime
import os, json

# ======================================================
# Blueprint
# ======================================================

doc_bp = Blueprint('doc', __name__, url_prefix='/doc')


# ======================================================
# Pages
# ======================================================

@doc_bp.route('/doc-page')
def docPage():
    """
    Render the documentation page.

    Reads the 'doc' key from leader.json located in the instance folder
    and passes it to the template.
    """
    file_path = os.path.join(current_app.instance_path, 'leader.json')
    with open(file_path, 'r') as f:
        data = json.load(f)
    datadoc = data['doc']

    return render_template('doc.html', doc=datadoc)


# ======================================================
# Notes:
# The following code is commented out as it seems to be
# copied from users.py. Keeping it here for reference.
# ======================================================

# # RETURN USERS PAGE ==========================================================
# @users_bp.route('/user-page', methods=['GET'])
# @jwt_required()
# def new_user_page():
#     usersData = User.query.all()
#     user_exists = User.query.filter_by(id=get_jwt_identity()).first()
#     return render_template('users.html', users=usersData, user=user_exists)

# # LIST ALL USERS = LIST ===================================================
# @users_bp.route('/users-list',methods=['GET'])
# def get_users_list(profile_filter=None):
#     query = User.query
#     if profile_filter:
#         query = query.filter_by(profile=profile_filter)
#     users = query.all()
#     return [
#         {
#             "id": u.id,
#             "name": u.name,
#             "email": u.email,
#             "password": u.password,
#             "profile": u.profile,
#             "coauthor": u.coauthor,
#         } for u in users
#     ]
