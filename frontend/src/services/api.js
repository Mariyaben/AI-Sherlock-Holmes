import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || 'Server error occurred';
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      throw new Error('Request failed. Please try again.');
    }
  }
);

// Chat API
export const sendMessage = async (data) => {
  return api.post('/api/chat', data);
};

export const getChatHistory = async (sessionId) => {
  const response = await api.get(`/api/chat/history/${sessionId}`);
  return response.history || [];
};

export const clearChatHistory = async (sessionId) => {
  return api.delete(`/api/chat/history/${sessionId}`);
};

// Cases API
export const getCases = async () => {
  return api.get('/api/cases');
};

export const getCaseContent = async (caseName) => {
  return api.get(`/api/cases/${caseName}`);
};

export const searchCases = async (query, limit = 5) => {
  return api.post('/api/search', { query, limit });
};

// Health check
export const checkHealth = async () => {
  return api.get('/health');
};

export default api;
