// API Configuration for different environments
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000').replace(/\/$/, '');

// Debug logging
console.log('🔧 API Configuration Debug:');
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('Final API_BASE_URL:', API_BASE_URL);
console.log('Final SOCKET_URL:', SOCKET_URL);

export const apiConfig = {
  baseURL: API_BASE_URL,
  socketURL: SOCKET_URL,
  endpoints: {
    auth: {
      login: `${API_BASE_URL}/api/auth/login`,
      register: `${API_BASE_URL}/api/auth/register`,
    },
    chat: `${API_BASE_URL}/api/chatbot/chat`,
    satellites: `${API_BASE_URL}/api/satellites`,
    cosmicEvents: `${API_BASE_URL}/api/cosmic-events`,
    apod: `${API_BASE_URL}/api/apod`,
    nasaGallery: `${API_BASE_URL}/api/gallery/search`,
    cosmicObjects: `${API_BASE_URL}/api/cosmic-objects`,
  }
};

console.log('🔧 Generated endpoints:', apiConfig.endpoints);

export default apiConfig;
