const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const details = await response.json().catch(() => ({}));
    throw new Error(details.error || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const carbonApi = {
  async getProfile() {
    return request('/profile');
  },

  async updateProfile(profile) {
    return request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    });
  },

  async getEmissions() {
    return request('/emissions');
  },

  async saveEmission(entry) {
    return request('/emissions', {
      method: 'POST',
      body: JSON.stringify(entry)
    });
  },

  async updateEmission(month, fields) {
    return request(`/emissions/${encodeURIComponent(month)}`, {
      method: 'PATCH',
      body: JSON.stringify(fields)
    });
  },

  async getAssistantPlan(goal) {
    return request('/assistant', {
      method: 'POST',
      body: JSON.stringify({ goal })
    });
  }
};
