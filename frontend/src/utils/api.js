const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}, token) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }

  // For blob responses (Excel export)
  if (options.blob) return res.blob();

  return res.json();
}

export const api = {
  // Auth
  googleLogin: (credential) =>
    request('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),

  getMe: (token) => request('/auth/me', {}, token),

  // Expenses
  getExpenses: (token, params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return request(`/expenses${qs ? '?' + qs : ''}`, {}, token);
  },

  addExpense: (token, data) =>
    request('/expenses', { method: 'POST', body: JSON.stringify(data) }, token),

  updateExpense: (token, id, data) =>
    request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),

  deleteExpense: (token, id) =>
    request(`/expenses/${id}`, { method: 'DELETE' }, token),

  getDashboard: (token) => request('/expenses/stats/dashboard', {}, token),

  getCategories: (token) => request('/expenses/categories', {}, token),

  exportExpenses: async (token) => {
    const BASE_URL = import.meta.env.VITE_API_URL || '/api';
    const res = await fetch(`${BASE_URL}/expenses/export`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Export failed');
    return res.blob();
  },
};
