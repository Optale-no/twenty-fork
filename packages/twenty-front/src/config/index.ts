const getDefaultUrl = () => {
  if (
    window.location.hostname.endsWith('localhost') ||
    window.location.hostname.endsWith('127.0.0.1')
  ) {
    // In development environment front and backend usually run on separate ports
    // we set the default value to localhost:3000.
    // In dev context, we use env vars to overwrite it
    return `http://${window.location.hostname}:3000`;
  } else {
    // Outside of localhost we assume that they run on the same port
    // because the backend will serve the frontend
    // In prod context, we use index.html + window var to ovewrite it
    return `${window.location.protocol}//${window.location.hostname}${
      window.location.port ? `:${window.location.port}` : ''
    }`;
  }
};

export const REACT_APP_SERVER_BASE_URL =
  window._env_?.REACT_APP_SERVER_BASE_URL ||
  process.env.REACT_APP_SERVER_BASE_URL ||
  getDefaultUrl();

export const REACT_APP_ORM_GRAPH_URL =
  window._env_?.REACT_APP_ORM_GRAPH_URL ||
  process.env.REACT_APP_ORM_GRAPH_URL ||
  '';

const getDefaultOagApiBaseUrl = () => {
  if (
    window.location.hostname.endsWith('localhost') ||
    window.location.hostname.endsWith('127.0.0.1')
  ) {
    return 'http://127.0.0.1:3601';
  }

  return 'https://vault-api.optale.no';
};

export const REACT_APP_OAG_API_BASE_URL =
  window._env_?.REACT_APP_OAG_API_BASE_URL ||
  process.env.REACT_APP_OAG_API_BASE_URL ||
  getDefaultOagApiBaseUrl();
