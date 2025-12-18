from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Integer, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.extensions import db
import enum

class TournamentStatus(str, enum.Enum):
    PLANNED = "Planned"
    ACTIVE = "Active"
    COMPLETED = "Completed"

class Tournament(db.Model):
    __tablename__ = 'tournaments'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    game_type: Mapped[str] = mapped_column(String(50), nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[TournamentStatus] = mapped_column(Enum(TournamentStatus), default=TournamentStatus.PLANNED)

    # Relationships
    teams: Mapped[List["Team"]] = relationship(back_populates="tournament", cascade="all, delete-orphan")
    matches: Mapped[List["Match"]] = relationship(back_populates="tournament", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "game_type": self.game_type,
            "date": self.date.isoformat(),
            "status": self.status.value,
            "team_count": len(self.teams)
        }

class Team(db.Model):
    __tablename__ = 'teams'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    tournament_id: Mapped[int] = mapped_column(ForeignKey('tournaments.id'), nullable=False)

    # Relationships
    tournament: Mapped["Tournament"] = relationship(back_populates="teams")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "tournament_id": self.tournament_id
        }

class Match(db.Model):
    __tablename__ = 'matches'

    id: Mapped[int] = mapped_column(primary_key=True)
    tournament_id: Mapped[int] = mapped_column(ForeignKey('tournaments.id'), nullable=False)
    team1_id: Mapped[int] = mapped_column(ForeignKey('teams.id'), nullable=False)
    team2_id: Mapped[int] = mapped_column(ForeignKey('teams.id'), nullable=False)
    winner_id: Mapped[Optional[int]] = mapped_column(ForeignKey('teams.id'), nullable=True)
    score: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    round_number: Mapped[int] = mapped_column(Integer, default=1)
    
    # Scheduling fields
    scheduled_date: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    scheduled_time: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    # Relationships
    tournament: Mapped["Tournament"] = relationship(back_populates="matches")
    team1: Mapped["Team"] = relationship(foreign_keys=[team1_id])
    team2: Mapped["Team"] = relationship(foreign_keys=[team2_id])
    winner: Mapped[Optional["Team"]] = relationship(foreign_keys=[winner_id])

    def to_dict(self):
        return {
            "id": self.id,
            "tournament_id": self.tournament_id,
            "team1": self.team1.to_dict(),
            "team2": self.team2.to_dict(),
            "winner_id": self.winner_id,
            "score": self.score,
            "round_number": self.round_number,
            "scheduled_date": self.scheduled_date,
            "scheduled_time": self.scheduled_time,
            "location": self.location
        }
