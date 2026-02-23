# MagiMagi

Task management system with role-based access (author / coauthor / leader),
JWT authentication and plugin integration.

## Tech Stack
- Python / Flask
- Flask-JWT-Extended
- SQLAlchemy
- Jinja2
- Vanilla JavaScript
- PostgreSQL / SQLite (dev)

## Main Features
- User authentication (JWT via cookies)
- Task creation and filtering
- Role-based views (author / coauthor)
- Browser plugin integration
- Leader sharing and visibility rules

## Project Structure
- `run.py` – application entry point
- `app/` – application factory, blueprints and models
- `clue.md` – system map and architectural documentation

## Documentation
For a detailed explanation of the system flow and architecture,
see [`clue.md`](./clue.md).

## Running the project
```bash
python run.py
