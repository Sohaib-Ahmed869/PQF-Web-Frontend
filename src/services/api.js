import axios from 'axios';

// Define baseURL with better fallback handling
const baseURL = import.meta.env.VITE_API_URL || 'https://backendpqf.foodservices.live/api';
console.log('🔧 API Configuration: baseURL set to:', baseURL);

// Create axios instance with base configuration
const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000, // 30 second timeout for payment operations
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(
  (config) => {
    // Ensure config is a valid object
    if (!config || typeof config !== 'object') {
      console.error('❌ API Request Interceptor: Invalid config object');
      return Promise.reject(new Error('Invalid request configuration'));
    }

    const token = localStorage.getItem('token');
    console.log('Token',token)
    
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Ensure response is a valid object
    if (!response || typeof response !== 'object') {
      console.error('❌ API Response Interceptor: Invalid response object');
      return Promise.reject(new Error('Invalid response object'));
    }

    console.log('✅ API Response Interceptor Success:', {
      url: response.config?.url,
      status: response.status,
      statusText: response.statusText,
      dataKeys: Object.keys(response.data || {})
    });
    return response;
  },
  (error) => {
    // Ensure error is a valid object before processing
    if (!error || typeof error !== 'object') {
      console.error('❌ API Response Interceptor: Invalid error object:', error);
      return Promise.reject(new Error('Invalid error object'));
    }

    // Safely extract error information
    const errorInfo = {
      message: error.message || 'Unknown error',
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown',
      data: error.response?.data,
      headers: error.config?.headers
    };
    
    console.error('❌ API Response Interceptor Error:', errorInfo);
    
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code;
      const errorMessage = error.response?.data?.message;
      
      console.log('🔐 API 401 Error:', { code: errorCode, message: errorMessage });
      
      // Only clear localStorage for token-related authentication errors
      const tokenRelatedErrors = [
        'TOKEN_EXPIRED',
        'INVALID_TOKEN', 
        'INVALID_USER',
        'TOKEN_VERIFICATION_FAILED',
        'TOKEN_NOT_ACTIVE'
      ];
      
      if (tokenRelatedErrors.includes(errorCode)) {
        console.log('🔐 API: Token-related auth error, clearing localStorage');
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