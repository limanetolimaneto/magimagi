from .extensions import db

# ======================================================
# User Model
# ======================================================
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)  # Primary key
    name = db.Column(db.String(100))  # User's full name
    email = db.Column(db.String(100), unique=True)  # User's email (must be unique)
    profile = db.Column(db.String(100))  # Profile type: 'author' or 'coauthor' (if coauthor, stores author ID)
    password = db.Column(db.String(100))  # Hashed password
    coauthor = db.Column(db.Integer, nullable=True)  # ID of coauthor; 0 or None if not applicable
    tasks = db.relationship('Task', backref='user', lazy=True)  # Relationship with Task table


# ======================================================
# Origin Model
# ======================================================
class Origin(db.Model):
    __tablename__ = 'origins'
    
    id = db.Column(db.Integer, primary_key=True)  # Primary key
    description = db.Column(db.Text)  # Name/description of the origin
    email = db.Column(db.String(100))  # Optional email
    type = db.Column(db.String(100))  # Type/category of origin
    notes = db.Column(db.String(255))  # Optional notes
    tasks = db.relationship('Task', backref='origin', lazy=True)  # Relationship with Task table


# ======================================================
# Task Model
# ======================================================
class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)  # Primary key
    author = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Author ID (foreign key)
    coauthor = db.Column(db.JSON, nullable=True)  # JSON list of coauthors
    origin_date = db.Column(db.Date)  # Date when task originates
    origin_time = db.Column(db.Time)  # Time of task creation
    deadline = db.Column(db.Date, nullable=True)  # Optional deadline
    description = db.Column(db.Text)  # Main task description
    instructions = db.Column(db.Text, nullable=True)  # Optional instructions
    comments = db.Column(db.JSON, nullable=True)  # List of comments (JSON)
    origin_id = db.Column(db.Integer, db.ForeignKey('origins.id'), nullable=True)  # Optional origin ID
    editable = db.Column(db.JSON)  # JSON list of user IDs allowed to edit
    visibility = db.Column(db.JSON)  # JSON list of user IDs allowed to see
    readers = db.Column(db.JSON)  # JSON list of reader IDs
    status = db.Column(db.String(100))  # Task status: skatch, started, responded, standingby, solved, canceled
    reminde_me = db.Column(db.Date, nullable=True)  # Optional reminder date
    leader = db.Column(db.Boolean, default=False, nullable=False)  # Is the task shared with the leader?


# ======================================================
# Reader Model
# ======================================================
class Reader(db.Model):
    __tablename__ = 'readers'
    
    id = db.Column(db.Integer, primary_key=True)  # Primary key
    description = db.Column(db.Text)  # Reader name or description
    email = db.Column(db.String(100))  # Optional email
    notes = db.Column(db.String(255))  # Optional notes
