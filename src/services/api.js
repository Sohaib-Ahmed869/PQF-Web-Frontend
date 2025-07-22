import axios from 'axios';

// Define baseURL once
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL,
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      console.log('API: Token expired, clearing localStorage');
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);
export const GOOGLE_AUTH_URL = baseURL + '/auth/google';

export default api; 
