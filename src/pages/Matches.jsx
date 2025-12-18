import { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';

// Determine match status based on schedule and winner
function getMatchStatus(match) {
    // If match has winner, it's finished
    if (match.winner_id) return 'finished';

    // If no scheduled date/time, it's not scheduled
    if (!match.scheduled_date) return 'not_scheduled';

    // Parse scheduled datetime
    const now = new Date();
    const scheduledDate = new Date(match.scheduled_date + (match.scheduled_time ? `T${match.scheduled_time}` : 'T00:00'));

    // If current time is past scheduled time, match is live
    if (now >= scheduledDate) return 'live';

    // Otherwise, not yet started
    return 'upcoming';
}

function getStatusBadge(status) {
    switch (status) {
        case 'live':
            return <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold animate-pulse">🔴 LIVE</span>;
        case 'finished':
            return <span className="px-3 py-1 bg-white/20 text-white/60 rounded-full text-xs font-bold">✓ Finished</span>;
        case 'upcoming':
            return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold">⏳ Upcoming</span>;
        default:
            return <span className="px-3 py-1 bg-white/10 text-white/40 rounded-full text-xs font-bold">Not Scheduled</span>;
    }
}

function MatchCard({ match, onClick }) {
    const status = getMatchStatus(match);
    const [team1Score, team2Score] = (match.score || '0-0').split('-').map(s => parseInt(s) || 0);

    return (
        <div onClick={() => onClick(match)} className="match-card relative group block cursor-pointer">
            <div className="absolute inset-0 bg-brand-primary/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 rounded-2xl" />
            <div className={`relative p-6 bg-white/5 border backdrop-blur-md rounded-2xl hover:border-brand-primary/50 transition-colors h-full ${status === 'live' ? 'border-green-500/50' : 'border-white/10'}`}>
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    {getStatusBadge(status)}
                    <span className="text-xs text-white/40">{match.tournament_name}</span>
                </div>

                {/* Teams & Score */}
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex-1">
                        <p className={`text-lg font-bold truncate ${match.winner_id === match.team1?.id ? 'text-green-400' : ''}`}>
                            {match.team1?.name || 'TBD'}
                        </p>
                    </div>
                    <div className="text-2xl font-black text-center min-w-[80px]">
                        <span className={match.winner_id === match.team1?.id ? 'text-green-400' : ''}>{team1Score}</span>
                        <span className="text-white/30 mx-1">-</span>
                        <span className={match.winner_id === match.team2?.id ? 'text-green-400' : ''}>{team2Score}</span>
                    </div>
                    <div className="flex-1 text-right">
                        <p className={`text-lg font-bold truncate ${match.winner_id === match.team2?.id ? 'text-green-400' : ''}`}>
                            {match.team2?.name || 'TBD'}
                        </p>
                    </div>
                </div>

                {/* Schedule Info */}
                <div className="border-t border-white/10 pt-3 flex items-center gap-4 text-sm text-white/50">
                    {match.scheduled_date && (
                        <span>📅 {match.scheduled_date}</span>
                    )}
                    {match.scheduled_time && (
                        <span>🕐 {match.scheduled_time}</span>
                    )}
                    {match.location && (
                        <span>📍 {match.location}</span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Matches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [scoreData, setScoreData] = useState({ team1_score: 0, team2_score: 0 });
    const container = useRef();
    const hasAnimated = useRef(false);

    const fetchMatches = async () => {
        try {
            const data = await api.getAllMatches();
            setMatches(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    useGSAP(() => {
        if (loading || hasAnimated.current) return;
        hasAnimated.current = true;

        gsap.from('.page-title', {
            clipPath: 'inset(0 100% 0 0)',
            duration: 0.8,
            ease: 'power4.out',
            delay: 0.2
        });

        gsap.from('.page-subtitle', {
            opacity: 0, y: 20, duration: 0.5, ease: 'power3.out', delay: 0.4
        });

        if (matches.length > 0) {
            gsap.from('.match-card', {
                y: 50,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out',
                delay: 0.5
            });
        }
    }, { scope: container, dependencies: [loading] });

    const openMatchModal = (match) => {
        setSelectedMatch(match);
        const [team1Score, team2Score] = (match.score || '0-0').split('-').map(s => parseInt(s) || 0);
        setScoreData({ team1_score: team1Score, team2_score: team2Score });
        setModalOpen(true);
    };

    const handleSaveScore = async () => {
        if (!selectedMatch) return;
        const score = `${scoreData.team1_score}-${scoreData.team2_score}`;
        await api.updateMatch(selectedMatch.id, { score });
        setModalOpen(false);
        fetchMatches();
    };

    const handleFinishMatch = async () => {
        if (!selectedMatch) return;

        // Determine winner based on score
        let winner_id = null;
        if (scoreData.team1_score > scoreData.team2_score) {
            winner_id = selectedMatch.team1.id;
        } else if (scoreData.team2_score > scoreData.team1_score) {
            winner_id = selectedMatch.team2.id;
        }

        if (!winner_id) {
            alert('Cannot finish match with a tie. Scores must be different.');
            return;
        }

        const score = `${scoreData.team1_score}-${scoreData.team2_score}`;
        await api.updateMatch(selectedMatch.id, { score, winner_id });
        setModalOpen(false);
        fetchMatches();
    };

    // Group matches by status
    const liveMatches = matches.filter(m => getMatchStatus(m) === 'live');
    const upcomingMatches = matches.filter(m => getMatchStatus(m) === 'upcoming');
    const finishedMatches = matches.filter(m => getMatchStatus(m) === 'finished');
    const notScheduledMatches = matches.filter(m => getMatchStatus(m) === 'not_scheduled');

    if (loading) {
        return (
            <div className="pt-32 min-h-screen flex items-center justify-center relative z-10">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl text-white/60">Loading Matches...</p>
                </div>
            </div>
        );
    }

    const matchStatus = selectedMatch ? getMatchStatus(selectedMatch) : null;

    return (
        <main ref={container} className="pt-32 px-6 min-h-screen relative z-10">
            <header className="max-w-7xl mx-auto mb-16">
                <h1 className="page-title text-6xl font-black font-display uppercase tracking-tighter mb-4">
                    Matches
                </h1>
                <p className="page-subtitle text-white/60 text-xl">
                    All tournament matches. Click to view details or update scores.
                </p>
            </header>

            <div className="max-w-7xl mx-auto pb-20 space-y-12">
                {matches.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-white/20 rounded-2xl">
                        <p className="text-white/40 text-xl mb-4">No matches yet.</p>
                        <Link to="/tournaments" className="px-6 py-3 bg-brand-primary text-white font-bold hover:brightness-110 transition-all inline-block">
                            View Tournaments
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Live Matches */}
                        {liveMatches.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                                    Live Now ({liveMatches.length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {liveMatches.map(match => (
                                        <MatchCard key={match.id} match={match} onClick={openMatchModal} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Upcoming Matches */}
                        {upcomingMatches.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                    Upcoming ({upcomingMatches.length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {upcomingMatches.map(match => (
                                        <MatchCard key={match.id} match={match} onClick={openMatchModal} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Finished Matches */}
                        {finishedMatches.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-white/30"></span>
                                    Finished ({finishedMatches.length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {finishedMatches.map(match => (
                                        <MatchCard key={match.id} match={match} onClick={openMatchModal} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Not Scheduled */}
                        {notScheduledMatches.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-white/20"></span>
                                    Not Scheduled ({notScheduledMatches.length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {notScheduledMatches.map(match => (
                                        <MatchCard key={match.id} match={match} onClick={openMatchModal} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>

            {/* Match Detail Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={matchStatus === 'live' ? '🔴 Live Match' : matchStatus === 'finished' ? 'Match Result' : 'Match Details'}>
                {selectedMatch && (
                    <div className="space-y-6">
                        {/* Status Banner */}
                        {matchStatus === 'upcoming' && (
                            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center">
                                <p className="text-blue-400 font-bold">⏳ Match Not Live Yet</p>
                                <p className="text-white/60 text-sm mt-1">Scheduled: {selectedMatch.scheduled_date} at {selectedMatch.scheduled_time || 'TBD'}</p>
                            </div>
                        )}

                        {matchStatus === 'not_scheduled' && (
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                                <p className="text-white/60">📅 Match not scheduled yet</p>
                            </div>
                        )}

                        {matchStatus === 'finished' && (
                            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                                <p className="text-green-400 font-bold">✓ Match Finished</p>
                                <p className="text-white/60 text-sm mt-1">Winner: {selectedMatch.winner_id === selectedMatch.team1?.id ? selectedMatch.team1?.name : selectedMatch.team2?.name}</p>
                            </div>
                        )}

                        {/* Score Section - Only editable for live matches */}
                        {matchStatus === 'live' && (
                            <>
                                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center mb-4">
                                    <p className="text-green-400 font-bold animate-pulse">🔴 Match is LIVE</p>
                                </div>

                                {/* Team 1 Score */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                    <span className="font-bold text-lg flex-1">{selectedMatch.team1?.name}</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setScoreData({ ...scoreData, team1_score: Math.max(0, scoreData.team1_score - 1) })}
                                            className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-bold text-xl"
                                        >
                                            −
                                        </button>
                                        <span className="text-3xl font-black w-12 text-center">{scoreData.team1_score}</span>
                                        <button
                                            type="button"
                                            onClick={() => setScoreData({ ...scoreData, team1_score: scoreData.team1_score + 1 })}
                                            className="w-10 h-10 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-bold text-xl"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Team 2 Score */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                    <span className="font-bold text-lg flex-1">{selectedMatch.team2?.name}</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setScoreData({ ...scoreData, team2_score: Math.max(0, scoreData.team2_score - 1) })}
                                            className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-bold text-xl"
                                        >
                                            −
                                        </button>
                                        <span className="text-3xl font-black w-12 text-center">{scoreData.team2_score}</span>
                                        <button
                                            type="button"
                                            onClick={() => setScoreData({ ...scoreData, team2_score: scoreData.team2_score + 1 })}
                                            className="w-10 h-10 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-bold text-xl"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-2">
                                    <button onClick={handleSaveScore} className="flex-1 py-3 bg-brand-primary text-white font-bold rounded-lg hover:brightness-110">
                                        Save Score
                                    </button>
                                    <button onClick={handleFinishMatch} className="flex-1 py-3 bg-green-500 text-white font-bold rounded-lg hover:brightness-110">
                                        Finish Match
                                    </button>
                                </div>
                            </>
                        )}

                        {/* For finished/upcoming - just show score */}
                        {(matchStatus === 'finished' || matchStatus === 'upcoming' || matchStatus === 'not_scheduled') && (
                            <div className="text-center py-4">
                                <p className="text-4xl font-black">
                                    {scoreData.team1_score} - {scoreData.team2_score}
                                </p>
                                <div className="flex justify-between mt-4 text-white/60">
                                    <span>{selectedMatch.team1?.name}</span>
                                    <span>{selectedMatch.team2?.name}</span>
                                </div>
                            </div>
                        )}

                        {/* Tournament Link */}
                        <Link
                            to={`/tournaments/${selectedMatch.tournament_id}?tab=bracket`}
                            className="block text-center py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm rounded-lg transition-colors"
                        >
                            View Tournament →
                        </Link>
                    </div>
                )}
            </Modal>
        </main>
    );
}
