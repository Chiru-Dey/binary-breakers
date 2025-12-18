import { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';

function TournamentCard({ tournament }) {
    return (
        <Link to={`/tournaments/${tournament.id}`} className="tournament-card block relative group">
            <div className="absolute inset-0 bg-brand-primary/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 rounded-2xl" />
            <div className="relative p-8 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl hover:border-brand-primary/50 transition-colors h-full flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-secondary/10 rounded-full blur-2xl -mr-10 -mt-10" />

                <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${tournament.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                            tournament.status === 'Completed' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-brand-primary/20 text-brand-primary'
                        }`}>
                        {tournament.status}
                    </span>
                    <h3 className="text-2xl font-bold font-display tracking-tight mb-2">{tournament.name}</h3>
                    <p className="text-white/60 text-sm">{tournament.game_type}</p>
                </div>

                <div className="mt-8 flex justify-between items-end border-t border-white/10 pt-4">
                    <div className="text-center">
                        <span className="block text-2xl font-bold">{tournament.team_count || 0}</span>
                        <span className="text-xs text-white/40 uppercase tracking-widest">Teams</span>
                    </div>
                    <div className="text-right">
                        <span className="block text-sm text-white/80">{new Date(tournament.date).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function Dashboard() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const container = useRef();

    useEffect(() => {
        api.getTournaments().then(data => {
            setTournaments(data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    useGSAP(() => {
        if (!loading && tournaments.length > 0) {
            gsap.from('.tournament-card', {
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out'
            });
        }
    }, [loading, tournaments]);

    if (loading) return <div className="pt-32 text-center">Loading...</div>;

    return (
        <main ref={container} className="pt-32 px-6 min-h-screen">
            <header className="max-w-7xl mx-auto mb-16 flex justify-between items-end">
                <div>
                    <h1 className="text-6xl font-black font-display uppercase tracking-tighter mb-4">Tournaments</h1>
                    <p className="text-white/60">Select a tournament to manage or view results.</p>
                </div>
                <button className="px-6 py-3 bg-brand-primary font-bold hover:bg-white hover:text-black transition-colors">
                    + Create New
                </button>
            </header>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {tournaments.map((t, i) => (
                    <TournamentCard key={t.id} tournament={t} index={i} />
                ))}
            </div>
        </main>
    );
}
