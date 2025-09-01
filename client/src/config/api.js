// API Configuration for different environments
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const apiConfig = {
  baseURL: API_BASE_URL,
  socketURL: SOCKET_URL,
  endpoints: {
    auth: {
      login: `${API_BASE_URL}/api/auth/login`,
      register: `${API_BASE_URL}/api/auth/register`,
    },
    chat: `${API_BASE_URL}/api/chat`,
    satellites: `${API_BASE_URL}/api/satellites`,
    cosmicEvents: `${API_BASE_URL}/api/cosmic-events`,
    apod: `${API_BASE_URL}/api/apod`,
    nasaGallery: `${API_BASE_URL}/api/nasa-gallery`,
    cosmicObjects: `${API_BASE_URL}/api/cosmic-objects`,
  }
};

export default apiConfig;
