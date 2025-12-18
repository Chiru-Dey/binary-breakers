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
        # Include list of tournament names this team is in
        team_dict['tournament_names'] = [tour.name for tour in t.tournaments]
        team_dict['tournament_ids'] = [tour.id for tour in t.tournaments]
        result.append(team_dict)
    return jsonify(result)

# Create standalone team
@bp.route('/teams', methods=['POST'])
def create_team():
    data = request.get_json()
    new_team = Team(name=data['name'])
    db.session.add(new_team)
    db.session.commit()
    return jsonify(new_team.to_dict()), 201

# Get teams for a specific tournament
@bp.route('/tournaments/<int:tournament_id>/teams', methods=['GET'])
def get_teams(tournament_id):
    tournament = db.session.get(Tournament, tournament_id)
    if not tournament:
        return jsonify({'error': 'Tournament not found'}), 404
    return jsonify([t.to_dict() for t in tournament.teams])

# Add team to tournament (link existing team)
@bp.route('/tournaments/<int:tournament_id>/teams', methods=['POST'])
def add_team_to_tournament(tournament_id):
    tournament = db.session.get(Tournament, tournament_id)
    if not tournament:
        return jsonify({'error': 'Tournament not found'}), 404
    
    data = request.get_json()
    
    # If team_id provided, link existing team
    if 'team_id' in data:
        team = db.session.get(Team, data['team_id'])
        if not team:
            return jsonify({'error': 'Team not found'}), 404
        if team not in tournament.teams:
            tournament.teams.append(team)
            db.session.commit()
        return jsonify(team.to_dict()), 200
    
    # If name provided, create new team and link
    if 'name' in data:
        new_team = Team(name=data['name'])
        db.session.add(new_team)
        tournament.teams.append(new_team)
        db.session.commit()
        return jsonify(new_team.to_dict()), 201
    
    return jsonify({'error': 'Either team_id or name required'}), 400

# Remove team from tournament
@bp.route('/tournaments/<int:tournament_id>/teams/<int:team_id>', methods=['DELETE'])
def remove_team_from_tournament(tournament_id, team_id):
    tournament = db.session.get(Tournament, tournament_id)
    if not tournament:
        return jsonify({'error': 'Tournament not found'}), 404
    
    team = db.session.get(Team, team_id)
    if not team:
        return jsonify({'error': 'Team not found'}), 404
    
    if team in tournament.teams:
        tournament.teams.remove(team)
        db.session.commit()
    
    return jsonify({'message': 'Team removed from tournament'})

# Update team
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

# Delete team
@bp.route('/teams/<int:id>', methods=['DELETE'])
def delete_team(id):
    team = db.session.get(Team, id)
    if not team:
        return jsonify({'error': 'Team not found'}), 404
    
    db.session.delete(team)
    db.session.commit()
    return jsonify({'message': 'Team deleted successfully'})
