from flask import Blueprint, request, jsonify
from backend.models import Match, Team, Tournament
from backend.extensions import db
import random

bp = Blueprint('matches', __name__, url_prefix='/api')

# Get all matches (for Schedule page)
@bp.route('/matches', methods=['GET'])
def get_all_matches():
    matches = db.session.execute(
        db.select(Match).order_by(Match.scheduled_date, Match.scheduled_time)
    ).scalars().all()
    result = []
    for m in matches:
        match_dict = m.to_dict()
        match_dict['tournament_name'] = m.tournament.name if m.tournament else None
        result.append(match_dict)
    return jsonify(result)

@bp.route('/tournaments/<int:tournament_id>/matches', methods=['GET'])
def get_matches(tournament_id):
    matches = db.session.execute(db.select(Match).filter_by(tournament_id=tournament_id).order_by(Match.round_number)).scalars().all()
    return jsonify([m.to_dict() for m in matches])

@bp.route('/tournaments/<int:tournament_id>/matches', methods=['POST'])
def create_match(tournament_id):
    data = request.get_json()
    team1_id = data.get('team1_id')
    team2_id = data.get('team2_id')
    
    if not team1_id or not team2_id:
        return jsonify({'error': 'Both team1_id and team2_id are required'}), 400
    
    if team1_id == team2_id:
        return jsonify({'error': 'Teams must be different'}), 400
    
    match = Match(
        tournament_id=tournament_id,
        team1_id=team1_id,
        team2_id=team2_id,
        round_number=1
    )
    db.session.add(match)
    db.session.commit()
    return jsonify(match.to_dict()), 201

@bp.route('/tournaments/<int:tournament_id>/generate-matches', methods=['POST'])
def generate_matches(tournament_id):
    # Get tournament and its teams
    tournament = db.session.get(Tournament, tournament_id)
    if not tournament:
        return jsonify({'error': 'Tournament not found'}), 404
    
    teams = list(tournament.teams)
    if len(teams) < 2:
        return jsonify({'error': 'Not enough teams to generate matches'}), 400
    
    # Shuffle for random pairing
    random.shuffle(teams)
    
    matches = []
    # Create pairs
    for i in range(0, len(teams), 2):
        if i + 1 < len(teams):
            match = Match(
                tournament_id=tournament_id,
                team1_id=teams[i].id,
                team2_id=teams[i+1].id,
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
