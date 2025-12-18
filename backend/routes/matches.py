from flask import Blueprint, request, jsonify
from backend.models import Match, Team, Tournament
from backend.extensions import db
import random

bp = Blueprint('matches', __name__, url_prefix='/api')

@bp.route('/tournaments/<int:tournament_id>/matches', methods=['GET'])
def get_matches(tournament_id):
    matches = db.session.execute(db.select(Match).filter_by(tournament_id=tournament_id).order_by(Match.round_number)).scalars().all()
    return jsonify([m.to_dict() for m in matches])

@bp.route('/tournaments/<int:tournament_id>/generate-matches', methods=['POST'])
def generate_matches(tournament_id):
    # Simple single elimination pairings for round 1
    teams = db.session.execute(db.select(Team).filter_by(tournament_id=tournament_id)).scalars().all()
    if len(teams) < 2:
        return jsonify({'error': 'Not enough teams to generate matches'}), 400
    
    # Shuffle for random pairing
    team_list = list(teams)
    random.shuffle(team_list)
    
    matches = []
    # Create pairs
    for i in range(0, len(team_list), 2):
        if i + 1 < len(team_list):
            match = Match(
                tournament_id=tournament_id,
                team1_id=team_list[i].id,
                team2_id=team_list[i+1].id,
                round_number=1
            )
            db.session.add(match)
            matches.append(match)
            
    db.session.commit()
    return jsonify([m.to_dict() for m in matches]), 201

@bp.route('/matches/<int:id>', methods=['GET'])
def get_match(id):
    match = db.session.get(Match, id)
    if not match:
        return jsonify({'error': 'Match not found'}), 404
    return jsonify(match.to_dict())

@bp.route('/matches/<int:id>', methods=['PUT'])
def update_match(id):
    match = db.session.get(Match, id)
    if not match:
        return jsonify({'error': 'Match not found'}), 404
        
    data = request.get_json()
    if 'score' in data:
        match.score = data['score']
    if 'winner_id' in data:
        match.winner_id = data['winner_id']
    # Scheduling fields
    if 'scheduled_date' in data:
        match.scheduled_date = data['scheduled_date']
    if 'scheduled_time' in data:
        match.scheduled_time = data['scheduled_time']
    if 'location' in data:
        match.location = data['location']
        
    db.session.commit()
    return jsonify(match.to_dict())

@bp.route('/matches/<int:id>', methods=['DELETE'])
def delete_match(id):
    match = db.session.get(Match, id)
    if not match:
        return jsonify({'error': 'Match not found'}), 404
    
    db.session.delete(match)
    db.session.commit()
    return jsonify({'message': 'Match deleted successfully'})
