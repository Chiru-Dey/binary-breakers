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
    const [showCreate, setShowCreate] = useState(false);
    const [newTournament, setNewTournament] = useState({ name: '', game_type: '' });
    const container = useRef();
    const hasAnimated = useRef(false);

    const fetchTournaments = () => {
        api.getTournaments().then(data => {
            setTournaments(data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    // Run animation only once after initial load
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

        gsap.from('.create-btn', {
            opacity: 0, y: 20, duration: 0.4, ease: 'power2.out', delay: 0.5
        });

        if (tournaments.length > 0) {
            gsap.from('.tournament-card', {
                y: 50,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out',
                delay: 0.6
            });
        }
    }, { scope: container, dependencies: [loading] });

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newTournament.name || !newTournament.game_type) return;
        await api.createTournament(newTournament);
        setNewTournament({ name: '', game_type: '' });
        setShowCreate(false);
        fetchTournaments();
    };

    if (loading) {
        return (
            <div className="pt-32 min-h-screen flex items-center justify-center relative z-10">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl text-white/60">Loading Tournaments...</p>
                </div>
            </div>
        );
    }

    return (
        <main ref={container} className="pt-32 px-6 min-h-screen relative z-10">
            <header className="max-w-7xl mx-auto mb-16 flex justify-between items-end">
                <div>
                    <h1 className="page-title text-6xl font-black font-display uppercase tracking-tighter mb-4">
                        Tournaments
                    </h1>
                    <p className="page-subtitle text-white/60">Select a tournament to manage or view results.</p>
                </div>
                <button 
                    onClick={() => setShowCreate(!showCreate)}
                    className="create-btn px-6 py-3 bg-brand-primary font-bold hover:bg-white hover:text-black transition-colors"
                >
                    + Create New
                </button>
            </header>

            {showCreate && (
                <div className="max-w-7xl mx-auto mb-12 p-8 bg-white/5 border border-brand-primary/30 rounded-2xl">
                    <h2 className="text-2xl font-bold mb-6">Create New Tournament</h2>
                    <form onSubmit={handleCreate} className="flex flex-wrap gap-4">
                        <input
                            type="text"
                            placeholder="Tournament Name"
                            value={newTournament.name}
                            onChange={(e) => setNewTournament({ ...newTournament, name: e.target.value })}
                            className="flex-1 min-w-[200px] bg-black/50 border border-white/20 p-4 rounded-lg focus:outline-none focus:border-brand-primary text-white cursor-text"
                            autoComplete="off"
                        />
                        <input
                            type="text"
                            placeholder="Game Type (e.g. Valorant)"
                            value={newTournament.game_type}
                            onChange={(e) => setNewTournament({ ...newTournament, game_type: e.target.value })}
                            className="flex-1 min-w-[200px] bg-black/50 border border-white/20 p-4 rounded-lg focus:outline-none focus:border-brand-primary text-white cursor-text"
                            autoComplete="off"
                        />
                        <button type="submit" className="px-8 py-4 bg-brand-secondary text-black font-bold hover:brightness-110 transition-all">
                            Create Tournament
                        </button>
                    </form>
                </div>
            )}

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {tournaments.map((t) => (
                    <TournamentCard key={t.id} tournament={t} />
                ))}
                {tournaments.length === 0 && (
                    <div className="col-span-full text-center py-20 border border-dashed border-white/20 rounded-2xl">
                        <p className="text-white/40 text-xl mb-4">No tournaments yet.</p>
                        <button 
                            onClick={() => setShowCreate(true)}
                            className="px-6 py-3 bg-brand-primary text-white font-bold hover:brightness-110 transition-all"
                        >
                            Create Your First Tournament
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
