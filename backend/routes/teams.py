from flask import Blueprint, request, jsonify
from backend.models import Team, Tournament
from backend.extensions import db

bp = Blueprint('teams', __name__, url_prefix='/api')

# Get all teams (global)
@bp.route('/teams', methods=['GET'])
def get_all_teams():
    teams = db.session.execute(db.select(Team).order_by(Team.name)).scalars().all()
    result = []
    for t in teams:
        team_dict = t.to_dict()
        team_dict['tournament_name'] = t.tournament.name if t.tournament else None
        result.append(team_dict)
    return jsonify(result)

# Create standalone team
@bp.route('/teams', methods=['POST'])
def create_team():
    data = request.get_json()
    new_team = Team(name=data['name'], tournament_id=data.get('tournament_id'))
    db.session.add(new_team)
    db.session.commit()
    return jsonify(new_team.to_dict()), 201

@bp.route('/tournaments/<int:tournament_id>/teams', methods=['GET'])
def get_teams(tournament_id):
    teams = db.session.execute(db.select(Team).filter_by(tournament_id=tournament_id)).scalars().all()
    return jsonify([t.to_dict() for t in teams])

@bp.route('/tournaments/<int:tournament_id>/teams', methods=['POST'])
def add_team(tournament_id):
    tournament = db.session.get(Tournament, tournament_id)
    if not tournament:
        return jsonify({'error': 'Tournament not found'}), 404
        
    data = request.get_json()
    new_team = Team(name=data['name'], tournament_id=tournament_id)
    db.session.add(new_team)
    db.session.commit()
    return jsonify(new_team.to_dict()), 201

@bp.route('/teams/<int:id>', methods=['PUT'])
def update_team(id):
    team = db.session.get(Team, id)
    if not team:
        return jsonify({'error': 'Team not found'}), 404
    
    data = request.get_json()
    if 'name' in data:
        team.name = data['name']
    
    db.session.commit()
    return jsonify(team.to_dict())

@bp.route('/teams/<int:id>', methods=['DELETE'])
def delete_team(id):
    team = db.session.get(Team, id)
    if not team:
        return jsonify({'error': 'Team not found'}), 404
    
    db.session.delete(team)
    db.session.commit()
    return jsonify({'message': 'Team deleted successfully'})
