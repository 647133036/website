const API = '/api';

function getTokens() {
  try {
    return JSON.parse(localStorage.getItem('mf_tokens') || '{}');
  } catch {
    return {};
  }
}
export { getTokens };
export function saveTokens(t) {
  localStorage.setItem('mf_tokens', JSON.stringify(t));
}
export function clearTokens() {
  localStorage.removeItem('mf_tokens');
}

let refreshing = null;
async function refreshTokens() {
  if (!refreshing) {
    refreshing = (async () => {
      const { refreshToken } = getTokens();
      if (!refreshToken) throw new Error('no-refresh');
      const r = await fetch(`${API}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      if (!r.ok) throw new Error('refresh-failed');
      const j = await r.json();
      const cur = getTokens();
      saveTokens({ accessToken: j.accessToken, refreshToken: j.refreshToken || cur.refreshToken });
      return j.accessToken;
    })().finally(() => (refreshing = null));
  }
  return refreshing;
}

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const opts = { method, headers: {} };
  if (body !== undefined) opts.headers['Content-Type'] = 'application/json';
  if (auth) {
    const t = getTokens();
    if (t.accessToken) opts.headers['Authorization'] = `Bearer ${t.accessToken}`;
  }
  let res = await fetch(`${API}${path}`, opts);
  if (res.status === 401 && auth) {
    try {
      await refreshTokens();
      const t = getTokens();
      opts.headers['Authorization'] = `Bearer ${t.accessToken}`;
      res = await fetch(`${API}${path}`, opts);
    } catch (e) {
      clearTokens();
      window.location.href = '/login';
      throw e;
    }
  }
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = data && data.error ? data.error : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export const auth = {
  login: (body) => api('/auth/login', { method: 'POST', body, auth: false }),
  register: (body) => api('/auth/register', { method: 'POST', body, auth: false }),
  me: () => api('/auth/me')
};
