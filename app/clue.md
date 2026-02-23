# Clue – MagiMagi System Map (v1.1)

This document is a **mental map of the MagiMagi system**, describing how the application starts, how requests flow through the backend, and how frontend and backend interact.

---

## 1. Entry Point

* `run.py`

  * Calls `create_app()` from `app/__init__.py`
  * Starts the Flask application
  * Acts as the single runtime entry point

---

## 2. Application Factory

* `app/__init__.py`

  * Loads configuration from `app/config.py`
  * Initializes:

    * Flask app
    * Database (`db`)
    * JWT authentication
    * CORS
  * Registers all blueprints
  * Registers Jinja2 filters (e.g. `datetimeformat`)

**Concept:**
The Application Factory is the **heart of the system**.
Nothing exists before it, everything depends on it.

---

## 3. Happy Path (Main User Flow)

### 3.1 Home Page

* `/`
  → `homePage()`
  → `render_template('home.html')`

From the home page:

```html
<a href="/users" class="login-btn">Go to Login</a>
```

---

### 3.2 Login Page

* `/users`
  → `loginPage()`
  → `render_template('login.html')`

Frontend behavior:

* JavaScript sends credentials using:

  * `fetch(`${serverUrl}/users/signin`)`

---

### 3.3 Authentication

* `/users/signin`
  → `loginSignIn()`
  → `make_response()`
  → `set_cookie(JWT)`

Response includes:

* `redirect_url = "/tasks/main-task"`

---

### 3.4 Main Desktop Page

* `/tasks/main-task`
  → `main_task_page()`

Rendering logic:

* If `user.profile == 'author'`
  → `render_template('main-task.html')`
* If `user.profile == 'coauthor'`
  → `render_template('main-task-coauthor.html')`

---

## 4. Blueprints / Features Overview

---

### 4.1 Public Blueprint

* `/`
  → `homePage()`
  → `render_template('home.html')`

Template utilities:

* `format_date(date_str)`
  → Returns formatted date (`DD/MM/YYYY`)

---

### 4.2 Users Blueprint

* `/users`
  → `loginPage()`
  → `render_template('login.html')`

* `/signin`
  → `loginSignIn()`
  → Sets JWT cookie
  → Returns `redirect_url = '/tasks/main-task'`

* `/signup`
  → `loginSignUp()`
  → `return jsonify({'title': 'ok'}), 200`

* `/logout`
  → `logout()`
  → Deletes JWT cookie
  → `return jsonify({'success': true}), 200`

* `/users-list`
  → `get_users_list(profile_filter=None)`
  → Returns list of users (query result)

* `/users-json`
  → `get_users_json()`
  → `return jsonify(get_users_list())`

* `/user-update`
  → `update_user()`
  → `return jsonify({'title': 'ok'}), 200`

* `/user-page`
  → `new_user_page()`
  → `render_template('users.html')`

---

### 4.3 Tasks Blueprint

* `/tasks/main-task`
  → `main_task_page()`
  → `render_template('main-task.html' | 'main-task-coauthor.html')`

* `/tasks/tasks`
  → `tasks_page()`
  → `render_template('tasks.html')`

* `/tasks/save-task` **[POST]**
  → `save_task()`
  → Creates task
  → Returns JSON response

* `/tasks/save-task-from-plugin` **[POST]**
  → `save_task_from_plugin()`
  → Creates task from MagiMagi browser plugin
  → Returns JSON response

* `/tasks/tasks-list`
  → `get_tasks_list()`
  → Returns filtered task list (JSON)

⚠️ **Note:**
Some route handlers (e.g. `get_tasks_list`) are also used as internal service functions.
This works, but may be refactored later into:

* Controller layer (HTTP)
* Service layer (business logic)

---

### 4.4 Settings / Leader Blueprint

* `/leader/settings-page`
  → `SettingsController.render_page()`

* `/leader/new-leader-set`
  → `SettingsController.set_leader()`

* `/leader/...`
  → Other leader-related routes

---

## 5. Frontend JavaScript Mapping

* `main.js`

  * Initializes authentication state
  * Handles global buttons and popups

* `auth.js`

  * Login and logout logic
  * JWT/session handling via fetch

* `config.js`

  * Server URL
  * Global profile variables

* `hiddenFunctions.js`

  * Utility helpers for forms and tasks

* `filters.js`

  * Task filters
  * UI interaction logic

* `users.js`

  * User management actions
  * Forms and button handlers

---

## 6. Architectural Notes & Patterns

* **Application Factory**
  Centralized app creation and configuration

* **Blueprints**
  Feature-based route grouping

* **Models**
  Handle persistence and data structure

* **Controllers / Views**
  Handle requests, apply rules, return responses

* **Frontend (JS)**
  Consumes API endpoints and controls UI behavior

---

## 7. Refactor Targets (Future Improvements)

* Split large controllers into smaller services
* Separate HTTP logic from business logic
* Standardize API response formats
* Modularize frontend JS by feature
* Centralize route constants for maintainability
