import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import Modal from '../components/Modal';

export default function TournamentDetails() {
    const { id } = useParams();
    const [tournament, setTournament] = useState(null);
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const [activeTab, setActiveTab] = useState('teams');
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    // Modal states
    const [teamModalOpen, setTeamModalOpen] = useState(false);
    const [teamModalMode, setTeamModalMode] = useState('create');
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [teamName, setTeamName] = useState('');

    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [scheduleData, setScheduleData] = useState({ scheduled_date: '', scheduled_time: '', location: '' });

    const [resultModalOpen, setResultModalOpen] = useState(false);
    const [resultData, setResultData] = useState({ score: '', winner_id: null });

    useEffect(() => {
        let isMounted = true;

        (async () => {
            try {
                const [tData, teamData, matchData] = await Promise.all([
                    api.getTournament(id),
                    api.getTeams(id),
                    api.getMatches(id)
                ]);
                if (isMounted) {
                    setTournament(tData);
                    setTeams(teamData);
                    setMatches(matchData);
                    setLoading(false);
                }
            } catch (e) {
                console.error(e);
                if (isMounted) setLoading(false);
            }
        })();

        return () => { isMounted = false; };
    }, [id, refreshKey]);

    const triggerRefresh = useCallback(() => setRefreshKey(k => k + 1), []);

    // Team handlers
    const openAddTeamModal = () => {
        setTeamModalMode('create');
        setTeamName('');
        setTeamModalOpen(true);
    };

    const openEditTeamModal = (team) => {
        setTeamModalMode('edit');
        setSelectedTeam(team);
        setTeamName(team.name);
        setTeamModalOpen(true);
    };

    const handleTeamSubmit = async (e) => {
        e.preventDefault();
        if (!teamName.trim()) return;

        if (teamModalMode === 'create') {
            await api.addTeam(id, teamName);
        } else {
            await api.updateTeam(selectedTeam.id, { name: teamName });
        }

        setTeamModalOpen(false);
        triggerRefresh();
    };

    const handleDeleteTeam = async (team) => {
        if (confirm(`Delete team "${team.name}"?`)) {
            await api.deleteTeam(team.id);
            triggerRefresh();
        }
    };

    // Match handlers
    const handleGenerate = async () => {
        await api.generateMatches(id);
        triggerRefresh();
    };

    const openScheduleModal = (match) => {
        setSelectedMatch(match);
        setScheduleData({
            scheduled_date: match.scheduled_date || '',
            scheduled_time: match.scheduled_time || '',
            location: match.location || ''
        });
        setScheduleModalOpen(true);
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMatch) return;
        await api.updateMatch(selectedMatch.id, scheduleData);
        setScheduleModalOpen(false);
        triggerRefresh();
    };

    const openResultModal = (match) => {
        setSelectedMatch(match);
        setResultData({
            score: match.score || '',
            winner_id: match.winner_id || null
        });
        setResultModalOpen(true);
    };

    const handleResultSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMatch) return;
        await api.updateMatch(selectedMatch.id, resultData);
        setResultModalOpen(false);
        triggerRefresh();
    };

    const handleDeleteMatch = async (match) => {
        if (confirm(`Delete this match?`)) {
            await api.deleteMatch(match.id);
            triggerRefresh();
        }
    };

    if (loading) {
        return (
            <div className="pt-32 min-h-screen flex items-center justify-center relative z-10">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl text-white/60">Loading Arena Data...</p>
                </div>
            </div>
        );
    }

    if (!tournament) {
        return (
            <div className="pt-32 min-h-screen flex items-center justify-center relative z-10">
                <p className="text-red-500 text-2xl">Tournament not found</p>
            </div>
        );
    }

    return (
        <main className="pt-32 px-6 min-h-screen max-w-7xl mx-auto relative z-10">
            <div className="mb-12 border-b border-white/10 pb-8">
                <span className="text-brand-primary font-bold tracking-widest uppercase text-sm mb-2 block">{tournament.game_type}</span>
                <h1 className="text-5xl md:text-7xl font-black font-display uppercase tracking-tighter mb-4">{tournament.name}</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('teams')}
                        className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'teams' ? 'bg-white text-black' : 'bg-transparent border border-white/20 hover:bg-white/10'}`}
                    >
                        Teams ({teams.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('bracket')}
                        className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'bracket' ? 'bg-white text-black' : 'bg-transparent border border-white/20 hover:bg-white/10'}`}
                    >
                        Matches ({matches.length})
                    </button>
                </div>
            </div>

            {/* Teams Tab */}
            {activeTab === 'teams' && (
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold">Registered Teams</h2>
                        <button onClick={openAddTeamModal} className="px-6 py-2 bg-brand-primary text-white font-bold rounded-lg hover:brightness-110 transition-all">
                            + Add Team
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teams.map(team => (
                            <div key={team.id} className="p-6 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center hover:bg-white/10 transition-colors">
                                <div>
                                    <span className="font-bold text-lg">{team.name}</span>
                                    <span className="text-white/40 text-sm ml-2">#{team.id}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditTeamModal(team)} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm">✏️</button>
                                    <button onClick={() => handleDeleteTeam(team)} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm">🗑️</button>
                                </div>
                            </div>
                        ))}
                        {teams.length === 0 && (
                            <div className="col-span-full text-center py-16 border border-dashed border-white/20 rounded-2xl">
                                <p className="text-white/40 text-xl mb-4">No teams registered yet.</p>
                                <button onClick={openAddTeamModal} className="px-6 py-3 bg-brand-primary text-white font-bold hover:brightness-110">
                                    Add First Team
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Bracket/Matches Tab */}
            {activeTab === 'bracket' && (
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold">Match Schedule</h2>
                        {matches.length === 0 && (
                            <button
                                onClick={handleGenerate}
                                disabled={teams.length < 2}
                                className={`px-6 py-3 font-bold rounded-lg transition-all ${teams.length >= 2
                                    ? 'bg-brand-secondary text-black hover:scale-105'
                                    : 'bg-white/20 text-white/50 cursor-not-allowed'
                                    }`}
                            >
                                🎯 Generate Bracket {teams.length < 2 && `(Need ${2 - teams.length} more team${2 - teams.length > 1 ? 's' : ''})`}
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {matches.map(match => (
                            <div key={match.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                                {/* Match header with teams */}
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                                    <div className="flex items-center gap-4 text-center md:text-left">
                                        <span className={`font-bold text-xl ${match.winner_id === match.team1?.id ? 'text-brand-secondary' : 'text-white'}`}>
                                            {match.team1?.name || 'TBD'}
                                        </span>
                                        <span className="text-white/30 font-display text-2xl">VS</span>
                                        <span className={`font-bold text-xl ${match.winner_id === match.team2?.id ? 'text-brand-secondary' : 'text-white'}`}>
                                            {match.team2?.name || 'TBD'}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={() => openScheduleModal(match)} className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-bold rounded-lg text-sm">
                                            📅 Schedule
                                        </button>
                                        <button onClick={() => openResultModal(match)} className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-bold rounded-lg text-sm">
                                            📊 Result
                                        </button>
                                        <button onClick={() => handleDeleteMatch(match)} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-lg text-sm">
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                {/* Schedule info */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                                    <div>
                                        <div className="text-white/40 text-xs uppercase mb-1">Date</div>
                                        <div className="font-mono">{match.scheduled_date || '—'}</div>
                                    </div>
                                    <div>
                                        <div className="text-white/40 text-xs uppercase mb-1">Time</div>
                                        <div className="font-mono">{match.scheduled_time || '—'}</div>
                                    </div>
                                    <div>
                                        <div className="text-white/40 text-xs uppercase mb-1">Location</div>
                                        <div>{match.location || '—'}</div>
                                    </div>
                                    <div>
                                        <div className="text-white/40 text-xs uppercase mb-1">Score</div>
                                        <div className="font-mono text-xl">{match.score || '—'}</div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {matches.length === 0 && teams.length >= 2 && (
                            <div className="text-center py-16 border border-dashed border-white/20 rounded-2xl">
                                <p className="text-white/40 text-xl mb-2">Ready to generate matches!</p>
                                <p className="text-white/30">Click "Generate Bracket" to create the match schedule.</p>
                            </div>
                        )}

                        {matches.length === 0 && teams.length < 2 && (
                            <div className="text-center py-16 border border-dashed border-brand-primary/30 rounded-2xl bg-brand-primary/5">
                                <p className="text-xl text-white/70 mb-2">⚠️ Need at least 2 teams to generate brackets</p>
                                <p className="text-white/40 mb-4">Currently registered: {teams.length} team{teams.length !== 1 ? 's' : ''}</p>
                                <button onClick={() => setActiveTab('teams')} className="px-6 py-2 bg-brand-primary text-white font-bold rounded-lg hover:brightness-110">
                                    Add Teams First
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add/Edit Team Modal */}
            <Modal isOpen={teamModalOpen} onClose={() => setTeamModalOpen(false)} title={teamModalMode === 'create' ? 'Add Team' : 'Edit Team'}>
                <form onSubmit={handleTeamSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">Team Name</label>
                        <input
                            type="text"
                            placeholder="Enter team name"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            className="w-full bg-black/50 border border-white/20 p-4 rounded-lg focus:outline-none focus:border-brand-primary text-white"
                            autoComplete="off"
                            required
                        />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setTeamModalOpen(false)} className="flex-1 py-3 border border-white/20 text-white font-bold rounded-lg hover:bg-white/10">
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 py-3 bg-brand-primary text-white font-bold rounded-lg hover:brightness-110">
                            {teamModalMode === 'create' ? 'Add Team' : 'Save'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Schedule Match Modal */}
            <Modal isOpen={scheduleModalOpen} onClose={() => setScheduleModalOpen(false)} title="Schedule Match">
                <form onSubmit={handleScheduleSubmit} className="space-y-4">
                    <div className="text-center mb-4 p-4 bg-white/5 rounded-lg">
                        <span className="font-bold">{selectedMatch?.team1?.name}</span>
                        <span className="text-white/40 mx-2">vs</span>
                        <span className="font-bold">{selectedMatch?.team2?.name}</span>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">Date</label>
                        <input
                            type="date"
                            value={scheduleData.scheduled_date}
                            onChange={(e) => setScheduleData({ ...scheduleData, scheduled_date: e.target.value })}
                            className="w-full bg-black/50 border border-white/20 p-4 rounded-lg focus:outline-none focus:border-brand-primary text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">Time</label>
                        <input
                            type="time"
                            value={scheduleData.scheduled_time}
                            onChange={(e) => setScheduleData({ ...scheduleData, scheduled_time: e.target.value })}
                            className="w-full bg-black/50 border border-white/20 p-4 rounded-lg focus:outline-none focus:border-brand-primary text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">Location / Venue</label>
                        <input
                            type="text"
                            placeholder="e.g. Main Stage, Online, Arena A"
                            value={scheduleData.location}
                            onChange={(e) => setScheduleData({ ...scheduleData, location: e.target.value })}
                            className="w-full bg-black/50 border border-white/20 p-4 rounded-lg focus:outline-none focus:border-brand-primary text-white"
                        />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setScheduleModalOpen(false)} className="flex-1 py-3 border border-white/20 text-white font-bold rounded-lg hover:bg-white/10">
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-lg hover:brightness-110">
                            Save Schedule
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Update Result Modal */}
            <Modal isOpen={resultModalOpen} onClose={() => setResultModalOpen(false)} title="Update Match Result">
                <form onSubmit={handleResultSubmit} className="space-y-4">
                    <div className="text-center mb-4 p-4 bg-white/5 rounded-lg">
                        <span className="font-bold">{selectedMatch?.team1?.name}</span>
                        <span className="text-white/40 mx-2">vs</span>
                        <span className="font-bold">{selectedMatch?.team2?.name}</span>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">Score</label>
                        <input
                            type="text"
                            placeholder="e.g. 2-1, 16-14, 3-0"
                            value={resultData.score}
                            onChange={(e) => setResultData({ ...resultData, score: e.target.value })}
                            className="w-full bg-black/50 border border-white/20 p-4 rounded-lg focus:outline-none focus:border-brand-primary text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">Winner</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setResultData({ ...resultData, winner_id: selectedMatch?.team1?.id })}
                                className={`p-4 rounded-lg font-bold transition-all ${resultData.winner_id === selectedMatch?.team1?.id
                                    ? 'bg-brand-secondary text-black'
                                    : 'bg-white/10 hover:bg-white/20'
                                    }`}
                            >
                                {selectedMatch?.team1?.name}
                            </button>
                            <button
                                type="button"
                                onClick={() => setResultData({ ...resultData, winner_id: selectedMatch?.team2?.id })}
                                className={`p-4 rounded-lg font-bold transition-all ${resultData.winner_id === selectedMatch?.team2?.id
                                    ? 'bg-brand-secondary text-black'
                                    : 'bg-white/10 hover:bg-white/20'
                                    }`}
                            >
                                {selectedMatch?.team2?.name}
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setResultModalOpen(false)} className="flex-1 py-3 border border-white/20 text-white font-bold rounded-lg hover:bg-white/10">
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 py-3 bg-green-500 text-white font-bold rounded-lg hover:brightness-110">
                            Save Result
                        </button>
                    </div>
                </form>
            </Modal>
        </main>
    );
}
