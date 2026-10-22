const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

export function setAuthToken(token) {
  if (token) localStorage.setItem('medora:token', token);
  else localStorage.removeItem('medora:token');
}

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('medora:token');
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.blob();
  if (!response.ok) {
    const error = new Error(payload?.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.details = payload?.details;
    throw error;
  }
  return payload;
}

export const api = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => apiRequest(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => apiRequest(path, { method: 'DELETE' }),
};
