from app import create_app

# Create the Flask application using the application factory
app = create_app()


if __name__ == "__main__":
    """
    Run the Flask development server.

    - host='0.0.0.0' makes the server accessible from outside the container/machine
    - port=5001 defines the port where the backend will be available
    - debug=True enables auto-reload and detailed error messages (development only)
    """

    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True
    )
