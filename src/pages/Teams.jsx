import { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';

function TeamCard({ team, onEdit, onDelete }) {
    return (
        <div className="team-card relative group">
            <div className="absolute inset-0 bg-brand-secondary/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 rounded-2xl" />
            <div className="relative p-6 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl hover:border-brand-secondary/50 transition-colors">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold font-display mb-1">{team.name}</h3>
                        {team.tournament_name ? (
                            <Link
                                to={`/tournaments/${team.tournament_id}`}
                                className="text-sm text-brand-primary hover:underline"
                            >
                                {team.tournament_name}
                            </Link>
                        ) : (
                            <span className="text-sm text-white/40 italic">Not assigned to tournament</span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(team)}
                            className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={() => onDelete(team)}
                            className="text-xs px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Teams() {
    const [teams, setTeams] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [formData, setFormData] = useState({ name: '', tournament_id: '' });
    const container = useRef();
    const hasAnimated = useRef(false);

    const fetchTeams = async () => {
        try {
            const [teamsData, tournamentsData] = await Promise.all([
                api.getAllTeams(),
                api.getTournaments()
            ]);
            setTeams(teamsData);
            setTournaments(tournamentsData);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
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

        gsap.from('.create-btn', {
            opacity: 0, y: 20, duration: 0.4, ease: 'power2.out', delay: 0.5
        });

        if (teams.length > 0) {
            gsap.from('.team-card', {
                y: 50,
                opacity: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power3.out',
                delay: 0.6
            });
        }
    }, { scope: container, dependencies: [loading] });

    const openCreateModal = () => {
        setModalMode('create');
        setFormData({ name: '', tournament_id: '' });
        setModalOpen(true);
    };

    const openEditModal = (team) => {
        setModalMode('edit');
        setSelectedTeam(team);
        setFormData({ name: team.name, tournament_id: team.tournament_id || '' });
        setModalOpen(true);
    };

    const handleDelete = async (team) => {
        if (confirm(`Delete team "${team.name}"?`)) {
            await api.deleteTeam(team.id);
            fetchTeams();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return;

        const payload = {
            name: formData.name,
            tournament_id: formData.tournament_id || null
        };

        if (modalMode === 'create') {
            await api.createTeam(payload);
        } else {
            await api.updateTeam(selectedTeam.id, payload);
        }

        setModalOpen(false);
        fetchTeams();
    };

    if (loading) {
        return (
            <div className="pt-32 min-h-screen flex items-center justify-center relative z-10">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl text-white/60">Loading Teams...</p>
                </div>
            </div>
        );
    }

    return (
        <main ref={container} className="pt-32 px-6 min-h-screen relative z-10">
            <header className="max-w-7xl mx-auto mb-16 flex justify-between items-end">
                <div>
                    <h1 className="page-title text-6xl font-black font-display uppercase tracking-tighter mb-4">
                        Teams
                    </h1>
                    <p className="page-subtitle text-white/60 text-xl">
                        Manage all your teams. Assign them to tournaments to compete.
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="create-btn px-6 py-3 bg-brand-secondary font-bold hover:bg-white hover:text-black transition-colors"
                >
                    + Create Team
                </button>
            </header>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {teams.map(team => (
                    <TeamCard
                        key={team.id}
                        team={team}
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                    />
                ))}
                {teams.length === 0 && (
                    <div className="col-span-full text-center py-20 border border-dashed border-white/20 rounded-2xl">
                        <p className="text-white/40 text-xl mb-4">No teams yet.</p>
                        <button
                            onClick={openCreateModal}
                            className="px-6 py-3 bg-brand-secondary text-white font-bold hover:brightness-110 transition-all"
                        >
                            Create Your First Team
                        </button>
                    </div>
                )}
            </div>

            {/* Create/Edit Team Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalMode === 'create' ? 'Create Team' : 'Edit Team'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">Team Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Team Alpha"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-black/50 border border-white/20 p-4 rounded-lg focus:outline-none focus:border-brand-secondary text-white"
                            autoComplete="off"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">Tournament (Optional)</label>
                        <select
                            value={formData.tournament_id}
                            onChange={(e) => setFormData({ ...formData, tournament_id: e.target.value })}
                            className="w-full bg-black/50 border border-white/20 p-4 rounded-lg focus:outline-none focus:border-brand-secondary text-white"
                        >
                            <option value="">No tournament</option>
                            {tournaments.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 border border-white/20 text-white font-bold rounded-lg hover:bg-white/10 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 py-3 bg-brand-secondary text-white font-bold rounded-lg hover:brightness-110 transition-all">
                            {modalMode === 'create' ? 'Create' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </Modal>
        </main>
    );
}
