import axios from 'axios';

// Define baseURL once
const baseURL = import.meta.env.VITE_API_URL || 'https://backendpqf.foodservices.live/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000, // 30 second timeout for payment operations
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
      const errorCode = error.response?.data?.code;
      const errorMessage = error.response?.data?.message;
      
      console.log('API 401 Error:', { code: errorCode, message: errorMessage });
      
      // Only clear localStorage for token-related authentication errors
      const tokenRelatedErrors = [
        'TOKEN_EXPIRED',
        'INVALID_TOKEN', 
        'INVALID_USER',
        'TOKEN_VERIFICATION_FAILED',
        'TOKEN_NOT_ACTIVE'
      ];
      
      if (tokenRelatedErrors.includes(errorCode)) {
        console.log('API: Token-related auth error, clearing localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Dispatch logout event
        window.dispatchEvent(new Event('user-logged-out'));
      }
      
      // Don't clear localStorage for other 401 errors like:
      // - Payment validation failures
      // - Business logic authorization failures
      // - Inactive user/store (these should be handled differently)
    }
    
    return Promise.reject(error);
  }
);

export const GOOGLE_AUTH_URL = baseURL + '/auth/google';
export default api;