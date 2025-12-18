from flask import Blueprint, request, jsonify
from backend.models import Tournament, TournamentStatus
from backend.extensions import db
from datetime import datetime

bp = Blueprint('tournaments', __name__, url_prefix='/api/tournaments')

@bp.route('', methods=['GET'])
def get_tournaments():
    tournaments = db.session.execute(db.select(Tournament).order_by(Tournament.date.desc())).scalars().all()
    return jsonify([t.to_dict() for t in tournaments])

@bp.route('', methods=['POST'])
def create_tournament():
    data = request.get_json()
    new_tournament = Tournament(
        name=data['name'],
        game_type=data['game_type'],
        date=datetime.fromisoformat(data['date'].replace('Z', '+00:00')) if 'date' in data else datetime.utcnow()
    )
    db.session.add(new_tournament)
    db.session.commit()
    return jsonify(new_tournament.to_dict()), 201

@bp.route('/<int:id>', methods=['GET'])
def get_tournament(id):
    tournament = db.session.get(Tournament, id)
    if not tournament:
        return jsonify({'error': 'Tournament not found'}), 404
    return jsonify(tournament.to_dict())

@bp.route('/<int:id>', methods=['PUT'])
def update_tournament(id):
    tournament = db.session.get(Tournament, id)
    if not tournament:
        return jsonify({'error': 'Tournament not found'}), 404
    
    data = request.get_json()
    if 'name' in data:
        tournament.name = data['name']
    if 'game_type' in data:
        tournament.game_type = data['game_type']
    if 'status' in data:
        tournament.status = TournamentStatus(data['status'])
    if 'date' in data:
        tournament.date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
    
    db.session.commit()
    return jsonify(tournament.to_dict())

@bp.route('/<int:id>', methods=['DELETE'])
def delete_tournament(id):
    tournament = db.session.get(Tournament, id)
    if not tournament:
        return jsonify({'error': 'Tournament not found'}), 404
    
    db.session.delete(tournament)
    db.session.commit()
    return jsonify({'message': 'Tournament deleted successfully'})
