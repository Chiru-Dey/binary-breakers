const API_BASE = 'http://127.0.0.1:5000/api';

export const api = {
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
  }
};
