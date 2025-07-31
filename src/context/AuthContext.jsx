import React, { createContext, useContext, useState, useEffect } from 'react';
import userService from '../services/userService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Auto-logout if token is missing from localStorage
  useEffect(() => {
    const localToken = localStorage.getItem('token');
    if (!localToken && (token || user)) {
      logout();
    }
  }, [token, user]);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await userService.login(credentials);
      console.log("UserService login response:", response);
      
      // The response structure is: response.data.data.user and response.data.data.token
      if (response.data && response.data.data && response.data.data.token && response.data.data.user) {
        const { token: newToken, user: userData } = response.data.data;
        
        console.log("Setting user data:", userData);
        console.log("User role:", userData.role);        
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { success: true, data: response.data.data };
      } else {
        console.error("Invalid response structure:", response);
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await userService.register(userData);
      // Don't automatically log the user in after registration
      // Let them navigate to login page instead
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Dispatch a custom event to notify other contexts (like Wishlist) to clear
    window.dispatchEvent(new Event('user-logged-out'));
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Check if user is super admin
  const isSuperAdmin = () => {
    return hasRole('superAdmin');
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('admin');
  };

  // Check if user is customer
  const isCustomer = () => {
    return hasRole('customer');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
    isSuperAdmin,
    isAdmin,
    isCustomer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 