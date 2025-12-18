import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';

// Determine match status based on schedule and winner
function getMatchStatus(match) {
    if (match.winner_id) return 'finished';
    if (!match.scheduled_date) return 'not_scheduled';

    const now = new Date();
    const scheduledDate = new Date(match.scheduled_date + (match.scheduled_time ? `T${match.scheduled_time}` : 'T00:00'));

    if (now >= scheduledDate) return 'live';
    return 'upcoming';
}

export default function MatchDetail() {
    const { id } = useParams();
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scoreData, setScoreData] = useState({ team1_score: 0, team2_score: 0 });
    const [saving, setSaving] = useState(false);

    const fetchMatch = async () => {
        try {
            const data = await api.getMatch(id);
            setMatch(data);
            const [t1, t2] = (data.score || '0-0').split('-').map(s => parseInt(s) || 0);
            setScoreData({ team1_score: t1, team2_score: t2 });
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        (async () => {
            try {
                const data = await api.getMatch(id);
                if (isMounted) {
                    setMatch(data);
                    const [t1, t2] = (data.score || '0-0').split('-').map(s => parseInt(s) || 0);
                    setScoreData({ team1_score: t1, team2_score: t2 });
                    setLoading(false);
                }
            } catch (err) {
                console.error(err);
                if (isMounted) setLoading(false);
            }
        })();

        return () => { isMounted = false; };
    }, [id]);

    const handleSaveScore = async () => {
        if (!match) return;
        setSaving(true);
        const score = `${scoreData.team1_score}-${scoreData.team2_score}`;
        await api.updateMatch(match.id, { score });
        await fetchMatch();
        setSaving(false);
    };

    const handleFinishMatch = async () => {
        if (!match) return;

        let winner_id = null;
        if (scoreData.team1_score > scoreData.team2_score) {
            winner_id = match.team1.id;
        } else if (scoreData.team2_score > scoreData.team1_score) {
            winner_id = match.team2.id;
        }

        if (!winner_id) {
            alert('Cannot finish match with a tie. Scores must be different.');
            return;
        }

        setSaving(true);
        const score = `${scoreData.team1_score}-${scoreData.team2_score}`;
        await api.updateMatch(match.id, { score, winner_id });
        await fetchMatch();
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="pt-32 min-h-screen flex items-center justify-center relative z-10">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl text-white/60">Loading Match...</p>
                </div>
            </div>
        );
    }

    if (!match) {
        return (
            <div className="pt-32 min-h-screen flex items-center justify-center relative z-10">
                <div className="text-center">
                    <p className="text-2xl text-white/60">Match not found</p>
                    <Link to="/matches" className="mt-4 inline-block text-brand-primary hover:underline">← Back to Matches</Link>
                </div>
            </div>
        );
    }

    const status = getMatchStatus(match);

    return (
        <main className="pt-32 px-4 md:px-6 min-h-screen relative z-10">
            <div className="max-w-3xl mx-auto">
                {/* Back Link */}
                <Link to="/matches" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 md:mb-8 transition-colors text-sm md:text-base">
                    ← Back to Matches
                </Link>

                {/* Status Banner */}
                {status === 'upcoming' && (
                    <div className="p-4 md:p-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-center mb-6 md:mb-8">
                        <p className="text-xl md:text-3xl font-black text-blue-400">⏳ Match Not Live Yet</p>
                        <p className="text-white/60 mt-2 text-sm md:text-base">
                            Scheduled: {match.scheduled_date} at {match.scheduled_time || 'TBD'}
                            {match.location && ` • ${match.location}`}
                        </p>
                    </div>
                )}

                {status === 'not_scheduled' && (
                    <div className="p-4 md:p-6 bg-white/5 border border-white/10 rounded-2xl text-center mb-6 md:mb-8">
                        <p className="text-xl md:text-3xl font-black text-white/40">📅 Match Not Scheduled</p>
                        <p className="text-white/60 mt-2 text-sm md:text-base">This match has no scheduled date yet.</p>
                    </div>
                )}

                {status === 'live' && (
                    <div className="p-4 md:p-6 bg-green-500/10 border border-green-500/30 rounded-2xl text-center mb-6 md:mb-8">
                        <p className="text-xl md:text-3xl font-black text-green-400 animate-pulse">🔴 LIVE</p>
                        {match.location && <p className="text-white/60 mt-2 text-sm md:text-base">📍 {match.location}</p>}
                    </div>
                )}

                {status === 'finished' && (
                    <div className="p-4 md:p-6 bg-white/5 border border-white/20 rounded-2xl text-center mb-6 md:mb-8">
                        <p className="text-xl md:text-3xl font-black text-white/60">✓ Match Finished</p>
                        <p className="text-brand-secondary mt-2 font-bold text-sm md:text-base">
                            Winner: {match.winner_id === match.team1?.id ? match.team1?.name : match.team2?.name}
                        </p>
                    </div>
                )}

                {/* Score Display */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                        {/* Team 1 */}
                        <div className="flex-1 text-center w-full">
                            <p className={`text-lg md:text-2xl font-black mb-2 md:mb-4 ${match.winner_id === match.team1?.id ? 'text-green-400' : 'text-white'}`}>
                                {match.team1?.name || 'TBD'}
                            </p>
                            {status === 'live' ? (
                                <div className="flex items-center justify-center gap-2 md:gap-3">
                                    <button
                                        onClick={() => setScoreData({ ...scoreData, team1_score: Math.max(0, scoreData.team1_score - 1) })}
                                        className="w-10 h-10 md:w-12 md:h-12 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-bold text-xl md:text-2xl"
                                        disabled={saving}
                                    >
                                        −
                                    </button>
                                    <span className="text-3xl md:text-5xl font-black w-16 md:w-20 text-center">{scoreData.team1_score}</span>
                                    <button
                                        onClick={() => setScoreData({ ...scoreData, team1_score: scoreData.team1_score + 1 })}
                                        className="w-10 h-10 md:w-12 md:h-12 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-bold text-xl md:text-2xl"
                                        disabled={saving}
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                    <p className="text-3xl md:text-5xl font-black">{scoreData.team1_score}</p>
                            )}
                        </div>

                        {/* VS */}
                        <div className="text-2xl md:text-4xl font-black text-white/20">VS</div>

                        {/* Team 2 */}
                        <div className="flex-1 text-center w-full">
                            <p className={`text-lg md:text-2xl font-black mb-2 md:mb-4 ${match.winner_id === match.team2?.id ? 'text-green-400' : 'text-white'}`}>
                                {match.team2?.name || 'TBD'}
                            </p>
                            {status === 'live' ? (
                                <div className="flex items-center justify-center gap-2 md:gap-3">
                                    <button
                                        onClick={() => setScoreData({ ...scoreData, team2_score: Math.max(0, scoreData.team2_score - 1) })}
                                        className="w-10 h-10 md:w-12 md:h-12 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-bold text-xl md:text-2xl"
                                        disabled={saving}
                                    >
                                        −
                                    </button>
                                    <span className="text-3xl md:text-5xl font-black w-16 md:w-20 text-center">{scoreData.team2_score}</span>
                                    <button
                                        onClick={() => setScoreData({ ...scoreData, team2_score: scoreData.team2_score + 1 })}
                                        className="w-10 h-10 md:w-12 md:h-12 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-bold text-xl md:text-2xl"
                                        disabled={saving}
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                    <p className="text-3xl md:text-5xl font-black">{scoreData.team2_score}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons - Only for Live matches */}
                {status === 'live' && (
                    <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
                        <button
                            onClick={handleSaveScore}
                            disabled={saving}
                            className="flex-1 py-3 md:py-4 bg-brand-primary text-white font-bold rounded-xl hover:brightness-110 disabled:opacity-50 text-base md:text-lg"
                        >
                            {saving ? 'Saving...' : 'Save Score'}
                        </button>
                        <button
                            onClick={handleFinishMatch}
                            disabled={saving}
                            className="flex-1 py-3 md:py-4 bg-green-500 text-white font-bold rounded-xl hover:brightness-110 disabled:opacity-50 text-base md:text-lg"
                        >
                            {saving ? 'Finishing...' : 'Finish Match'}
                        </button>
                    </div>
                )}

                {/* Match Info */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-4 text-white/60">Match Info</h3>
                    <div className="space-y-3 text-white/80">
                        {match.scheduled_date && (
                            <p>📅 <span className="text-white/60">Date:</span> {match.scheduled_date}</p>
                        )}
                        {match.scheduled_time && (
                            <p>🕐 <span className="text-white/60">Time:</span> {match.scheduled_time}</p>
                        )}
                        {match.location && (
                            <p>📍 <span className="text-white/60">Location:</span> {match.location}</p>
                        )}
                        <p>🏆 <span className="text-white/60">Tournament:</span>
                            <Link to={`/tournaments/${match.tournament_id}?tab=bracket`} className="text-brand-primary hover:underline ml-1">
                                View Tournament
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
