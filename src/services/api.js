const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

export const api = {
  // All Teams (global)
  getAllTeams: async () => {
    const response = await fetch(`${API_BASE}/teams`);
    if (!response.ok) throw new Error('Failed to fetch teams');
    return response.json();
  },

  createTeam: async (data) => {
    const response = await fetch(`${API_BASE}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create team');
    return response.json();
  },

  // All Matches (for schedule)
  getAllMatches: async () => {
    const response = await fetch(`${API_BASE}/matches`);
    if (!response.ok) throw new Error('Failed to fetch matches');
    return response.json();
  },

  // Tournaments
  getTournaments: async () => {
    const response = await fetch(`${API_BASE}/tournaments`);
    if (!response.ok) throw new Error('Failed to fetch tournaments');
    return response.json();
  },
  
  createTournament: async (data) => {
    const response = await fetch(`${API_BASE}/tournaments`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create tournament');
    return response.json();
  },

  getTournament: async (id) => {
    const response = await fetch(`${API_BASE}/tournaments/${id}`);
    if (!response.ok) throw new Error('Failed to fetch tournament');
    return response.json();
  },

  updateTournament: async (id, data) => {
    const response = await fetch(`${API_BASE}/tournaments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update tournament');
    return response.json();
  },

  deleteTournament: async (id) => {
    const response = await fetch(`${API_BASE}/tournaments/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete tournament');
    return response.json();
  },
  
  // Teams
  getTeams: async (tournamentId) => {
      const response = await fetch(`${API_BASE}/tournaments/${tournamentId}/teams`);
      return response.json();
  },
  
  addTeam: async (tournamentId, name) => {
      const response = await fetch(`${API_BASE}/tournaments/${tournamentId}/teams`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ name })
      });
      return response.json();
  },

  updateTeam: async (id, data) => {
    const response = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  deleteTeam: async (id) => {
    const response = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  // Matches
  getMatches: async (tournamentId) => {
      const response = await fetch(`${API_BASE}/tournaments/${tournamentId}/matches`);
      return response.json();
  },
  
  generateMatches: async (tournamentId) => {
      const response = await fetch(`${API_BASE}/tournaments/${tournamentId}/generate-matches`, {
          method: 'POST'
      });
      return response.json();
  },

  updateMatch: async (matchId, data) => {
    const response = await fetch(`${API_BASE}/matches/${matchId}`, {
      method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    return response.json();
  },

  deleteMatch: async (matchId) => {
    const response = await fetch(`${API_BASE}/matches/${matchId}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};
