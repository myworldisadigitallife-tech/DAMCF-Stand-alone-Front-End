// ---------------------------------------------------------------------------
// Environment config — ONE place to switch API base URL.
// ---------------------------------------------------------------------------
// Local dev:      http://127.0.0.1:8000/damcf/api/v1
// PythonAnywhere: https://digitallife11.pythonanywhere.com/damcf/api/v1
// ---------------------------------------------------------------------------

const isLocalhost =
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1" ||
  location.hostname === "";

export const API_BASE = isLocalhost
  ? "http://127.0.0.1:8000/damcf/api/v1"
  : "https://digitallife11.pythonanywhere.com/damcf/api/v1";

export const SITE_URL = isLocalhost
  ? "http://127.0.0.1:8000"
  : "https://digitallife11.pythonanywhere.com";

// Local storage keys for JWT tokens
export const TOKEN_KEY = "damcf_access";
export const REFRESH_KEY = "damcf_refresh";



