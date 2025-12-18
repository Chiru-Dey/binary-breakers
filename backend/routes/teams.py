from flask import Blueprint, request, jsonify
from backend.models import Team, Tournament
from backend.extensions import db

bp = Blueprint('teams', __name__, url_prefix='/api/tournaments/<int:tournament_id>/teams')

@bp.route('', methods=['GET'])
def get_teams(tournament_id):
    teams = db.session.execute(db.select(Team).filter_by(tournament_id=tournament_id)).scalars().all()
    return jsonify([t.to_dict() for t in teams])

@bp.route('', methods=['POST'])
def add_team(tournament_id):
    tournament = db.session.get(Tournament, tournament_id)
    if not tournament:
        return jsonify({'error': 'Tournament not found'}), 404
        
    data = request.get_json()
    new_team = Team(name=data['name'], tournament_id=tournament_id)
    db.session.add(new_team)
    db.session.commit()
    return jsonify(new_team.to_dict()), 201
