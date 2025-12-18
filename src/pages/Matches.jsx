import { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';

// Determine match status based on schedule and winner
function getMatchStatus(match) {
    if (match.winner_id) return 'finished';
    if (!match.scheduled_date) return 'not_scheduled';

    const now = new Date();
    const scheduledDate = new Date(match.scheduled_date + (match.scheduled_time ? `T${match.scheduled_time}` : 'T00:00'));

    if (now >= scheduledDate) return 'live';
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

function MatchCard({ match }) {
    const status = getMatchStatus(match);
    const [team1Score, team2Score] = (match.score || '0-0').split('-').map(s => parseInt(s) || 0);

    return (
        <Link to={`/matches/${match.id}`} className="match-card relative group block">
            <div className="absolute inset-0 bg-brand-primary/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 rounded-2xl" />
            <div className={`relative p-6 bg-white/5 border backdrop-blur-md rounded-2xl hover:border-brand-primary/50 transition-colors h-full ${status === 'live' ? 'border-green-500/50' : 'border-white/10'}`}>
                <div className="flex justify-between items-start mb-4">
                    {getStatusBadge(status)}
                    <span className="text-xs text-white/40">{match.tournament_name}</span>
                </div>

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

                <div className="border-t border-white/10 pt-3 flex items-center gap-4 text-sm text-white/50">
                    {match.scheduled_date && <span>📅 {match.scheduled_date}</span>}
                    {match.scheduled_time && <span>🕐 {match.scheduled_time}</span>}
                    {match.location && <span>📍 {match.location}</span>}
                </div>
            </div>
        </Link>
    );
}

export default function Matches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const container = useRef();
    const hasAnimated = useRef(false);

    useEffect(() => {
        let isMounted = true;

        (async () => {
            try {
                const data = await api.getAllMatches();
                if (isMounted) {
                    setMatches(data);
                    setLoading(false);
                }
            } catch (err) {
                console.error(err);
                if (isMounted) setLoading(false);
            }
        })();

        return () => { isMounted = false; };
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
                y: 50, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.5
            });
        }
    }, { scope: container, dependencies: [loading] });

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
                        {liveMatches.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                                    Live Now ({liveMatches.length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {liveMatches.map(match => <MatchCard key={match.id} match={match} />)}
                                </div>
                            </section>
                        )}

                        {upcomingMatches.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                    Upcoming ({upcomingMatches.length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {upcomingMatches.map(match => <MatchCard key={match.id} match={match} />)}
                                </div>
                            </section>
                        )}

                        {finishedMatches.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-white/30"></span>
                                    Finished ({finishedMatches.length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {finishedMatches.map(match => <MatchCard key={match.id} match={match} />)}
                                </div>
                            </section>
                        )}

                        {notScheduledMatches.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-white/20"></span>
                                    Not Scheduled ({notScheduledMatches.length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {notScheduledMatches.map(match => <MatchCard key={match.id} match={match} />)}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
