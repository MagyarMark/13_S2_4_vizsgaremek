const normalizeBaseUrl = (value) => {
  if (!value) return '';
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

const getDefaultLocalBaseUrl = () => {
  const host = window.location.hostname;
  return `http://${host}:3000`;
};

export const getApiBaseUrl = () => {
  const envBase = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
  if (envBase) {
    return envBase;
  }

  return getDefaultLocalBaseUrl();
};

export const getApiUrl = (endpoint) => {
  if (!endpoint.startsWith('/')) {
    endpoint = `/${endpoint}`;
  }

  if (!getApiBaseUrl()) {
    return endpoint;
  }

  return `${getApiBaseUrl()}${endpoint}`;
};

export const getSocketUrl = () => {
  const envBase = normalizeBaseUrl(import.meta.env.VITE_SOCKET_BASE_URL);
  if (envBase) {
    return envBase;
  }

  return getApiBaseUrl();
};
