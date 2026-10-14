import { api, setTokens, clearTokens, getAccessToken } from "./api.js";

export async function login(email, password) {
  const data = await api("/auth/login/", {
    method: "POST",
    body: { username: email, password },
    auth: false,
  });
  setTokens({ access: data.access, refresh: data.refresh });
  return await me();
}

export async function register({ name, email, password, phone, title, bio }) {
  const data = await api("/auth/register/", {
    method: "POST",
    body: { name, email, password, phone, title, bio },
    auth: false,
  });
  setTokens({ access: data.access, refresh: data.refresh });
  return data.user;
}

export async function changePassword(oldPassword, newPassword) {
  return await api("/auth/change-password/", {
    method: "POST",
    body: { old_password: oldPassword, new_password: newPassword },
  });
}

export async function logout() {
  try {
    await api("/auth/logout/", { method: "POST" });
  } catch {
    /* ignore */
  }
  clearTokens();
}

export async function me() {
  if (!getAccessToken()) return null;
  try {
    return await api("/auth/me/");
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getAccessToken();
}