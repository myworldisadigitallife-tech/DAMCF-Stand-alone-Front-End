import { API_BASE, TOKEN_KEY, REFRESH_KEY } from "./config.js";

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------
export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem(TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// ---------------------------------------------------------------------------
// Automatic token refresh
// ---------------------------------------------------------------------------
let refreshing = null;

async function refreshAccessToken() {
  if (refreshing) return refreshing;

  const refresh = getRefreshToken();
  if (!refresh) return null;

  refreshing = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) {
        clearTokens();
        return null;
      }
      const data = await res.json();
      setTokens({ access: data.access, refresh: data.refresh || refresh });
      return data.access;
    } catch {
      clearTokens();
      return null;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}

// ---------------------------------------------------------------------------
// Main API call — handles JSON, JWT header, 401 retry, error normalization
// ---------------------------------------------------------------------------
export async function api(path, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    auth = true,
    isForm = false,
  } = options;

  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const finalHeaders = { ...headers };

  if (!isForm && body && !finalHeaders["Content-Type"]) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const init = { method, headers: finalHeaders };
  if (body) init.body = isForm ? body : JSON.stringify(body);

  let res = await fetch(url, init);

  // Auto-refresh once on 401
  if (res.status === 401 && auth) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      finalHeaders["Authorization"] = `Bearer ${newAccess}`;
      res = await fetch(url, { ...init, headers: finalHeaders });
    } else {
      window.dispatchEvent(new CustomEvent("auth:expired"));
    }
  }

  if (res.status === 204) return null;

  const contentType = res.headers.get("Content-Type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const err = new Error(`API ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// Shorthand methods
export const get = (path, opts = {}) => api(path, { ...opts, method: "GET" });
export const post = (path, body, opts = {}) =>
  api(path, { ...opts, method: "POST", body });
export const patch = (path, body, opts = {}) =>
  api(path, { ...opts, method: "PATCH", body });
export const del = (path, opts = {}) => api(path, { ...opts, method: "DELETE" });