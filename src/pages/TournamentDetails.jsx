import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import dayjs from 'dayjs';

// Dark theme for MUI pickers
const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#8B5CF6',
        },
    },
});

export default function TournamentDetails() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [tournament, setTournament] = useState(null);
    const [teams, setTeams] = useState([]);
    const [availableTeams, setAvailableTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'teams');
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    // Modal states
    const [teamModalOpen, setTeamModalOpen] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState('');

    const [matchModalOpen, setMatchModalOpen] = useState(false);
    const [matchFormData, setMatchFormData] = useState({
        team1_id: '',
        team2_id: '',
        scheduled_date: '',
        scheduled_time: '',
        location: ''
    });

    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [editData, setEditData] = useState({ team1_id: '', team2_id: '', scheduled_date: '', scheduled_time: '', location: '' });

    const [resultModalOpen, setResultModalOpen] = useState(false);
    const [resultData, setResultData] = useState({ team1_score: 0, team2_score: 0 });

    useEffect(() => {
        let isMounted = true;

        (async () => {
            try {
                const [tData, teamData, matchData, allTeamsData] = await Promise.all([
                    api.getTournament(id),
                    api.getTeams(id),
                    api.getMatches(id),
                    api.getAllTeams()
                ]);
                if (isMounted) {
                    setTournament(tData);
                    setTeams(teamData);
                    setMatches(matchData);
                    // Filter teams not assigned to any tournament or assigned to different tournament
                    const available = allTeamsData.filter(t => !t.tournament_id || t.tournament_id === parseInt(id));
                    const inThisTournament = teamData.map(t => t.id);
                    setAvailableTeams(available.filter(t => !inThisTournament.includes(t.id)));
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
        setSelectedTeamId('');
        setTeamModalOpen(true);
    };

    const handleTeamSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTeamId) return;

        // Add team to this tournament
        await api.addTeamToTournament(id, parseInt(selectedTeamId));
        setTeamModalOpen(false);
        triggerRefresh();
    };

    const handleRemoveTeam = async (team) => {
        if (confirm(`Remove team "${team.name}" from this tournament?`)) {
            await api.removeTeamFromTournament(id, team.id);
            triggerRefresh();
        }
    };

    // Match handlers
    const openMatchModal = () => {
        setMatchFormData({ team1_id: '', team2_id: '', scheduled_date: '', scheduled_time: '', location: '' });
        setMatchModalOpen(true);
    };

    const handleCreateMatch = async (e) => {
        e.preventDefault();
        if (!matchFormData.team1_id || !matchFormData.team2_id) return;
        if (matchFormData.team1_id === matchFormData.team2_id) {
            alert('Please select different teams');
            return;
        }
        await api.createMatch(id, matchFormData);
        setMatchModalOpen(false);
        triggerRefresh();
    };

    const openEditModal = (match) => {
        setSelectedMatch(match);
        setEditData({
            team1_id: String(match.team1?.id || ''),
            team2_id: String(match.team2?.id || ''),
            scheduled_date: match.scheduled_date || '',
            scheduled_time: match.scheduled_time || '',
            location: match.location || ''
        });
        setScheduleModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMatch) return;
        if (editData.team1_id === editData.team2_id) {
            alert('Please select different teams');
            return;
        }
        await api.updateMatch(selectedMatch.id, editData);
        setScheduleModalOpen(false);
        triggerRefresh();
    };

    const openResultModal = (match) => {
        setSelectedMatch(match);
        // Parse existing score like "2-1" into separate values
        const [team1Score, team2Score] = (match.score || '0-0').split('-').map(s => parseInt(s) || 0);
        setResultData({
            team1_score: team1Score,
            team2_score: team2Score
        });
        setResultModalOpen(true);
    };

    const handleResultSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMatch) return;
        // Combine scores into "X-Y" format
        const score = `${resultData.team1_score}-${resultData.team2_score}`;
        await api.updateMatch(selectedMatch.id, { score });
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
                                <button onClick={() => handleRemoveTeam(team)} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm" title="Remove from tournament">
                                    ✕ Remove
                                </button>
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
                        <h2 className="text-2xl font-bold">Matches ({matches.length})</h2>
                        <button
                            onClick={openMatchModal}
                            disabled={teams.length < 2}
                            className={`px-6 py-3 font-bold rounded-lg transition-all ${teams.length >= 2
                                ? 'bg-brand-primary text-white hover:scale-105'
                                : 'bg-white/20 text-white/50 cursor-not-allowed'
                                }`}
                        >
                            + Create Match {teams.length < 2 && `(Need ${2 - teams.length} more team${2 - teams.length > 1 ? 's' : ''})`}
                        </button>
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
                                        <button onClick={() => openEditModal(match)} className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-bold rounded-lg text-sm">
                                            ✏️ Edit
                                        </button>
                                        <button onClick={() => openResultModal(match)} className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-bold rounded-lg text-sm">
                                            📊 Score
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

            {/* Add Team to Tournament Modal */}
            <Modal isOpen={teamModalOpen} onClose={() => setTeamModalOpen(false)} title="Add Team to Tournament">
                <form onSubmit={handleTeamSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">Select Team</label>
                        {availableTeams.length > 0 ? (
                            <select
                                value={selectedTeamId}
                                onChange={(e) => setSelectedTeamId(e.target.value)}
                                className="w-full bg-black/50 border border-white/20 p-4 rounded-lg focus:outline-none focus:border-brand-primary text-white"
                                required
                            >
                                <option value="">Choose a team...</option>
                                {availableTeams.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="p-4 bg-white/5 rounded-lg text-white/60 text-center">
                                <p className="mb-2">No available teams.</p>
                                <p className="text-sm">Create teams first on the Teams page.</p>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setTeamModalOpen(false)} className="flex-1 py-3 border border-white/20 text-white font-bold rounded-lg hover:bg-white/10">
                            Cancel
                        </button>
                        <button type="submit" disabled={!selectedTeamId} className={`flex-1 py-3 font-bold rounded-lg transition-all ${selectedTeamId ? 'bg-brand-primary text-white hover:brightness-110' : 'bg-white/20 text-white/50 cursor-not-allowed'}`}>
                            Add to Tournament
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Create Match Modal */}
            <Modal isOpen={matchModalOpen} onClose={() => setMatchModalOpen(false)} title="Create Match">
                <form onSubmit={handleCreateMatch} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">Team 1</label>
                        <select
                            value={matchFormData.team1_id}
                            onChange={(e) => setMatchFormData({ ...matchFormData, team1_id: e.target.value })}
                            className="w-full bg-black/50 border border-white/20 p-4 rounded-lg focus:outline-none focus:border-brand-primary text-white"
                            required
                        >
                            <option value="">Select team...</option>
                            {teams.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="text-center text-2xl font-black text-white/40">VS</div>
                    <div>
                        <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">Team 2</label>
                        <select
                            value={matchFormData.team2_id}
                            onChange={(e) => setMatchFormData({ ...matchFormData, team2_id: e.target.value })}
                            className="w-full bg-black/50 border border-white/20 p-4 rounded-lg focus:outline-none focus:border-brand-primary text-white"
                            required
                        >
                            <option value="">Select team...</option>
                            {teams.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Scheduling Section */}
                    <div className="border-t border-white/10 pt-4 mt-4">
                        <h4 className="text-sm font-bold text-white/60 mb-4 uppercase tracking-wider">Schedule (Optional)</h4>
                        <ThemeProvider theme={darkTheme}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-white/60 mb-2">Date</label>
                                        <DatePicker
                                            value={matchFormData.scheduled_date ? dayjs(matchFormData.scheduled_date) : null}
                                            onChange={(newValue) => setMatchFormData({
                                                ...matchFormData,
                                                scheduled_date: newValue ? newValue.format('YYYY-MM-DD') : ''
                                            })}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: 'small',
                                                    sx: {
                                                        '& .MuiOutlinedInput-root': {
                                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                                            borderRadius: '0.5rem',
                                                        },
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/60 mb-2">Time</label>
                                        <TimePicker
                                            value={matchFormData.scheduled_time ? dayjs(matchFormData.scheduled_time, 'HH:mm') : null}
                                            onChange={(newValue) => setMatchFormData({
                                                ...matchFormData,
                                                scheduled_time: newValue ? newValue.format('HH:mm') : ''
                                            })}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: 'small',
                                                    sx: {
                                                        '& .MuiOutlinedInput-root': {
                                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                                            borderRadius: '0.5rem',
                                                        },
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </LocalizationProvider>
                        </ThemeProvider>
                        <div className="mt-4">
                            <label className="block text-xs text-white/60 mb-2">Location / Venue</label>
                            <input
                                type="text"
                                placeholder="e.g. Main Stage, Court A, Online"
                                value={matchFormData.location}
                                onChange={(e) => setMatchFormData({ ...matchFormData, location: e.target.value })}
                                className="w-full bg-black/50 border border-white/20 p-3 rounded-lg focus:outline-none focus:border-brand-primary text-white"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setMatchModalOpen(false)} className="flex-1 py-3 border border-white/20 text-white font-bold rounded-lg hover:bg-white/10">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!matchFormData.team1_id || !matchFormData.team2_id || matchFormData.team1_id === matchFormData.team2_id}
                            className={`flex-1 py-3 font-bold rounded-lg transition-all ${matchFormData.team1_id && matchFormData.team2_id && matchFormData.team1_id !== matchFormData.team2_id
                                    ? 'bg-brand-primary text-white hover:brightness-110'
                                    : 'bg-white/20 text-white/50 cursor-not-allowed'
                                }`}
                        >
                            Create Match
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Match Modal */}
            <Modal isOpen={scheduleModalOpen} onClose={() => setScheduleModalOpen(false)} title="Edit Match">
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    {/* Team Selection */}
                    <div>
                        <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">Team 1</label>
                        <select
                            value={editData.team1_id}
                            onChange={(e) => setEditData({ ...editData, team1_id: e.target.value })}
                            className="w-full bg-black/50 border border-white/20 p-4 rounded-lg focus:outline-none focus:border-brand-primary text-white"
                            required
                        >
                            <option value="">Select team...</option>
                            {teams.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="text-center text-2xl font-black text-white/40">VS</div>
                    <div>
                        <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">Team 2</label>
                        <select
                            value={editData.team2_id}
                            onChange={(e) => setEditData({ ...editData, team2_id: e.target.value })}
                            className="w-full bg-black/50 border border-white/20 p-4 rounded-lg focus:outline-none focus:border-brand-primary text-white"
                            required
                        >
                            <option value="">Select team...</option>
                            {teams.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Scheduling Section */}
                    <div className="border-t border-white/10 pt-4 mt-4">
                        <h4 className="text-sm font-bold text-white/60 mb-4 uppercase tracking-wider">Schedule</h4>
                        <ThemeProvider theme={darkTheme}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-white/60 mb-2">Date</label>
                                        <DatePicker
                                            value={editData.scheduled_date ? dayjs(editData.scheduled_date) : null}
                                            onChange={(newValue) => setEditData({
                                                ...editData,
                                                scheduled_date: newValue ? newValue.format('YYYY-MM-DD') : ''
                                            })}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: 'small',
                                                    sx: {
                                                        '& .MuiOutlinedInput-root': {
                                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                                            borderRadius: '0.5rem',
                                                        },
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/60 mb-2">Time</label>
                                        <TimePicker
                                            value={editData.scheduled_time ? dayjs(editData.scheduled_time, 'HH:mm') : null}
                                            onChange={(newValue) => setEditData({
                                                ...editData,
                                                scheduled_time: newValue ? newValue.format('HH:mm') : ''
                                            })}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: 'small',
                                                    sx: {
                                                        '& .MuiOutlinedInput-root': {
                                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                                            borderRadius: '0.5rem',
                                                        },
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </LocalizationProvider>
                        </ThemeProvider>
                        <div className="mt-4">
                            <label className="block text-xs text-white/60 mb-2">Location / Venue</label>
                            <input
                                type="text"
                                placeholder="e.g. Main Stage, Online, Arena A"
                                value={editData.location}
                                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                className="w-full bg-black/50 border border-white/20 p-3 rounded-lg focus:outline-none focus:border-brand-primary text-white"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setScheduleModalOpen(false)} className="flex-1 py-3 border border-white/20 text-white font-bold rounded-lg hover:bg-white/10">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={editData.team1_id === editData.team2_id}
                            className={`flex-1 py-3 font-bold rounded-lg transition-all ${editData.team1_id !== editData.team2_id
                                    ? 'bg-brand-primary text-white hover:brightness-110'
                                    : 'bg-white/20 text-white/50 cursor-not-allowed'
                                }`}
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Score Modal */}
            <Modal isOpen={resultModalOpen} onClose={() => setResultModalOpen(false)} title="Update Score">
                <form onSubmit={handleResultSubmit} className="space-y-6">
                    {/* Team 1 Score */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <span className="font-bold text-lg flex-1">{selectedMatch?.team1?.name}</span>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setResultData({ ...resultData, team1_score: Math.max(0, resultData.team1_score - 1) })}
                                className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-bold text-xl"
                            >
                                −
                            </button>
                            <span className="text-3xl font-black w-12 text-center">{resultData.team1_score}</span>
                            <button
                                type="button"
                                onClick={() => setResultData({ ...resultData, team1_score: resultData.team1_score + 1 })}
                                className="w-10 h-10 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-bold text-xl"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Team 2 Score */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <span className="font-bold text-lg flex-1">{selectedMatch?.team2?.name}</span>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setResultData({ ...resultData, team2_score: Math.max(0, resultData.team2_score - 1) })}
                                className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-bold text-xl"
                            >
                                −
                            </button>
                            <span className="text-3xl font-black w-12 text-center">{resultData.team2_score}</span>
                            <button
                                type="button"
                                onClick={() => setResultData({ ...resultData, team2_score: resultData.team2_score + 1 })}
                                className="w-10 h-10 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-bold text-xl"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button type="button" onClick={() => setResultModalOpen(false)} className="flex-1 py-3 border border-white/20 text-white font-bold rounded-lg hover:bg-white/10">
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 py-3 bg-green-500 text-white font-bold rounded-lg hover:brightness-110">
                            Save Score
                        </button>
                    </div>
                </form>
            </Modal>
        </main>
    );
}
