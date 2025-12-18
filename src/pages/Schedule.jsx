import { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';

function MatchCard({ match }) {
    const hasSchedule = match.scheduled_date || match.scheduled_time;
    
    return (
        <div className="match-card relative group">
            <div className="absolute inset-0 bg-brand-secondary/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 rounded-2xl" />
            <div className="relative p-6 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl hover:border-brand-secondary/50 transition-colors">
                {/* Tournament Badge */}
                <div className="flex justify-between items-start mb-4">
                    <span className="inline-block px-3 py-1 bg-brand-primary/20 text-brand-primary rounded-full text-xs font-bold">
                        {match.tournament_name || 'Unknown Tournament'}
                    </span>
                    <span className="text-xs text-white/40">Round {match.round_number}</span>
                </div>
                
                {/* Teams */}
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex-1 text-center">
                        <p className="text-lg font-bold truncate">{match.team1?.name || 'TBD'}</p>
                    </div>
                    <div className="text-brand-primary font-black text-xl">VS</div>
                    <div className="flex-1 text-center">
                        <p className="text-lg font-bold truncate">{match.team2?.name || 'TBD'}</p>
                    </div>
                </div>

                {/* Schedule Info */}
                {hasSchedule ? (
                    <div className="border-t border-white/10 pt-4 space-y-2">
                        {match.scheduled_date && (
                            <div className="flex items-center gap-2 text-sm text-white/60">
                                <span>📅</span>
                                <span>{match.scheduled_date}</span>
                                {match.scheduled_time && <span>at {match.scheduled_time}</span>}
                            </div>
                        )}
                        {match.location && (
                            <div className="flex items-center gap-2 text-sm text-white/60">
                                <span>📍</span>
                                <span>{match.location}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="border-t border-white/10 pt-4">
                        <p className="text-sm text-white/40 italic">Not yet scheduled</p>
                    </div>
                )}

                {/* View Tournament Link */}
                <Link 
                    to={`/tournaments/${match.tournament_id}`}
                    className="mt-4 block text-center py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm rounded-lg transition-colors"
                >
                    View Tournament →
                </Link>
            </div>
        </div>
    );
}

export default function Schedule() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const container = useRef();
    const hasAnimated = useRef(false);

    useEffect(() => {
        api.getAllMatches()
            .then(data => {
                setMatches(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
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

    // Group matches by date
    const groupedMatches = matches.reduce((groups, match) => {
        const date = match.scheduled_date || 'Unscheduled';
        if (!groups[date]) groups[date] = [];
        groups[date].push(match);
        return groups;
    }, {});

    // Sort dates (Unscheduled goes last)
    const sortedDates = Object.keys(groupedMatches).sort((a, b) => {
        if (a === 'Unscheduled') return 1;
        if (b === 'Unscheduled') return -1;
        return a.localeCompare(b);
    });

    if (loading) {
        return (
            <div className="pt-32 min-h-screen flex items-center justify-center relative z-10">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl text-white/60">Loading Schedule...</p>
                </div>
            </div>
        );
    }

    return (
        <main ref={container} className="pt-32 px-6 min-h-screen relative z-10">
            <header className="max-w-7xl mx-auto mb-16">
                <h1 className="page-title text-6xl font-black font-display uppercase tracking-tighter mb-4">
                    Schedule
                </h1>
                <p className="page-subtitle text-white/60 text-xl">
                    All tournament matches in chronological order.
                </p>
            </header>

            <div className="max-w-7xl mx-auto pb-20">
                {matches.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-white/20 rounded-2xl">
                        <p className="text-white/40 text-xl mb-4">No matches scheduled yet.</p>
                        <Link to="/tournaments" className="px-6 py-3 bg-brand-primary text-white font-bold hover:brightness-110 transition-all inline-block">
                            View Tournaments
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {sortedDates.map(date => (
                            <section key={date}>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <span className={`w-3 h-3 rounded-full ${date === 'Unscheduled' ? 'bg-white/30' : 'bg-brand-secondary'}`}></span>
                                    {date === 'Unscheduled' ? 'To Be Scheduled' : date}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {groupedMatches[date].map(match => (
                                        <MatchCard key={match.id} match={match} />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
