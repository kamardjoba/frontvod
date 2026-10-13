import { getApiBaseUrl } from './baseUrl.js';

const API_BASE = getApiBaseUrl();

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Ошибка запроса');
    error.status = res.status;
    throw error;
  }
  return data;
}

export const api = {
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),

  driverMe: () => request('/api/driver/me'),
  driverHistory: () => request('/api/driver/me/history'),
  startRest: (body) => request('/api/driver/me/rest/start', { method: 'POST', body: JSON.stringify(body) }),
  updatePlannedEnd: (body) =>
    request('/api/driver/me/rest/planned-end', { method: 'PATCH', body: JSON.stringify(body) }),
  confirmAvailable: () => request('/api/driver/me/rest/confirm-available', { method: 'POST' }),
  continueRest: (body) => request('/api/driver/me/rest/continue', { method: 'POST', body: JSON.stringify(body) }),
  endRestEarly: () => request('/api/driver/me/rest/end-early', { method: 'POST' }),

  adminDashboard: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/dashboard?${qs}`);
  },
  adminDriver: (id) => request(`/api/admin/drivers/${id}`),
  createDriver: (body) => request('/api/admin/drivers', { method: 'POST', body: JSON.stringify(body) }),
  updateDriver: (id, body) => request(`/api/admin/drivers/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  adminUpdateRest: (id, body) =>
    request(`/api/admin/drivers/${id}/rest`, { method: 'PATCH', body: JSON.stringify(body) }),

  notifications: () => request('/api/notifications'),
  markNotificationsRead: (ids) =>
    request('/api/notifications/read', { method: 'POST', body: JSON.stringify({ ids }) }),
};
