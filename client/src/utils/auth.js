/**
 * Global Authentication Utility for Physiocity
 * Ensures consistent localStorage management across the entire platform.
 */

export const AUTH_KEYS = {
  TOKEN: "adminToken",
  USER: "userData"
};

export const getAuthToken = () => localStorage.getItem(AUTH_KEYS.TOKEN);

export const getUserData = () => {
  const data = localStorage.getItem(AUTH_KEYS.USER);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    localStorage.removeItem(AUTH_KEYS.USER);
    return null;
  }
};

export const setAuthSession = (token, user) => {
  localStorage.setItem(AUTH_KEYS.TOKEN, token);
  localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
  // Dispatch a custom event to notify all components of the state change
  window.dispatchEvent(new Event("authChange"));
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_KEYS.TOKEN);
  localStorage.removeItem(AUTH_KEYS.USER);
  window.dispatchEvent(new Event("authChange"));
};

export const isAuthenticated = () => {
  const user = getUserData();
  return !!user && !!getAuthToken();
};

export const isAdmin = () => {
  const user = getUserData();
  return user?.role === 'admin';
};
