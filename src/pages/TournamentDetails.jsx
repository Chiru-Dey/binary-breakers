import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';

export default function TournamentDetails() {
    const { id } = useParams();
    const [tournament, setTournament] = useState(null);
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const [activeTab, setActiveTab] = useState('teams');
    const [loading, setLoading] = useState(true);
    const [newTeamName, setNewTeamName] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

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

    const handleAddTeam = useCallback(async (e) => {
        e.preventDefault();
        if (!newTeamName.trim()) return;
        await api.addTeam(id, newTeamName);
        setNewTeamName('');
        triggerRefresh();
    }, [id, newTeamName, triggerRefresh]);

    const handleGenerate = useCallback(async () => {
        await api.generateMatches(id);
        triggerRefresh();
    }, [id, triggerRefresh]);

    const handleUpdateScore = useCallback(async (matchId, score, winnerId) => {
        await api.updateMatch(matchId, score, winnerId);
        triggerRefresh();
    }, [triggerRefresh]);

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
                        Bracket / Matches
                    </button>
                </div>
            </div>

            {activeTab === 'teams' && (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Registered Teams</h2>
                            <ul className="space-y-4">
                                {teams.map(team => (
                                    <li key={team.id} className="p-4 bg-white/5 rounded-lg border border-white/10 flex justify-between items-center hover:bg-white/10 transition-colors">
                                        <span className="font-bold">{team.name}</span>
                                        <span className="text-xs text-white/40">#{team.id}</span>
                                    </li>
                                ))}
                                {teams.length === 0 && <li className="text-white/40 italic">No teams registered yet.</li>}
                            </ul>
                        </div>

                        <div className="p-8 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl h-fit">
                            <h3 className="text-xl font-bold mb-4">Register New Team</h3>
                            <form onSubmit={handleAddTeam} className="flex flex-col gap-4">
                                <input
                                    type="text"
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    placeholder="Enter Team Name"
                                    className="bg-black/50 border border-white/20 p-4 rounded-lg focus:outline-none focus:border-brand-primary text-white placeholder-white/30 cursor-text"
                                    autoComplete="off"
                                />
                                <button type="submit" className="bg-brand-primary text-white font-bold py-3 rounded-lg hover:brightness-110 transition-all">
                                    Add Team
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'bracket' && (
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold">Match Schedule</h2>
                        {matches.length === 0 && teams.length >= 2 && (
                            <button onClick={handleGenerate} className="px-6 py-2 bg-brand-secondary text-black font-bold rounded-lg hover:scale-105 transition-transform">
                                Generate Bracket
                            </button>
                        )}
                    </div>

                    <div className="grid gap-6">
                        {matches.map(match => (
                            <div key={match.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex-1 flex justify-between items-center w-full md:w-auto">
                                    <span className={`font-bold text-xl ${match.winner_id === match.team1?.id ? 'text-brand-secondary' : 'text-white'}`}>{match.team1?.name || 'TBD'}</span>
                                    <span className="mx-4 text-white/20 font-display font-light">VS</span>
                                    <span className={`font-bold text-xl ${match.winner_id === match.team2?.id ? 'text-brand-secondary' : 'text-white'}`}>{match.team2?.name || 'TBD'}</span>
                                </div>

                                <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                                    <div className="text-center">
                                        <div className="text-white/40 text-xs uppercase mb-1">Score</div>
                                        <div className="font-mono text-xl">{match.score || '-'}</div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => {
                                                const score = prompt("Enter score (e.g. 2-1):", match.score || '');
                                                if (score) handleUpdateScore(match.id, score, match.winner_id);
                                            }}
                                            className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded"
                                        >
                                            Edit Score
                                        </button>
                                        <button
                                            onClick={() => {
                                                const winner = confirm(`Set ${match.team1?.name} as winner?`) ? match.team1?.id : confirm(`Set ${match.team2?.name} as winner?`) ? match.team2?.id : null;
                                                if (winner) handleUpdateScore(match.id, match.score, winner);
                                            }}
                                            className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded"
                                        >
                                            Set Winner
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {matches.length === 0 && (
                            <div className="text-center py-20 border border-dashed border-white/20 rounded-2xl">
                                <p className="text-white/40">No matches scheduled yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
