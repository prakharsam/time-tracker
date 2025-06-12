const API_BASE = 'http://localhost:8000';

function getToken() {
  return sessionStorage.getItem('admin_jwt');
}

export async function apiFetch(endpoint, { method = 'GET', body, headers = {}, ...rest } = {}) {
  const token = getToken();
  const fetchHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };
  if (token) {
    fetchHeaders['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: fetchHeaders,
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...rest,
  });
  if (!res.ok) {
    let err;
    try {
      err = await res.json();
    } catch {
      err = { detail: res.statusText };
    }
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
} 