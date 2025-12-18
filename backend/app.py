import os
from flask import Flask
from backend.extensions import db, cors

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///brain_battle.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize extensions
    db.init_app(app)
    
    # Configure CORS for production (allow Vercel frontend)
    cors_origins = os.environ.get('CORS_ORIGINS', '*')
    cors.init_app(app, origins=cors_origins.split(','))

    # Register Blueprints
    from backend.routes import tournaments, teams, matches
    app.register_blueprint(tournaments.bp)
    app.register_blueprint(teams.bp)
    app.register_blueprint(matches.bp)

    # Create tables
    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
