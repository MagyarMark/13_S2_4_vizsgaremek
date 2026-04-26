const SESSION_EXPIRES_AT_KEY = 'sm_session_expires_at';
const SESSION_DURATION_MS = 45 * 60 * 1000;

export const refreshSessionTimeout = () => {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  localStorage.setItem(SESSION_EXPIRES_AT_KEY, String(expiresAt));
  return expiresAt;
};

export const getSessionExpiresAt = () => {
  const raw = localStorage.getItem(SESSION_EXPIRES_AT_KEY);
  if (!raw) return null;

  const value = Number(raw);
  if (!Number.isFinite(value)) return null;

  return value;
};

export const ensureSessionTimeout = () => {
  const hasToken = Boolean(localStorage.getItem('accessToken'));
  const hasUser = Boolean(localStorage.getItem('user'));

  if (!hasToken || !hasUser) return null;

  const expiresAt = getSessionExpiresAt();
  if (!expiresAt) {
    return refreshSessionTimeout();
  }

  return expiresAt;
};

export const isSessionExpired = () => {
  const expiresAt = getSessionExpiresAt();
  if (!expiresAt) return false;
  return Date.now() >= expiresAt;
};

export const clearSessionAuthData = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem(SESSION_EXPIRES_AT_KEY);
};
