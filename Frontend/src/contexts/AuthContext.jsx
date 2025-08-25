 
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api/auth';

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

 
  useEffect(() => {
    checkAuthStatus();
  }, []);

  
  const checkAuthStatus = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setCurrentUser(response.data);
      setError('');
    } catch (err) {
      setCurrentUser(null);
      console.error('Auth status check failed:', err);
    } finally {
      setLoading(false);
    }
  };

 
  const register = async (userData) => {
    try {
      setError('');
      const response = await authAPI.register(userData);
      setCurrentUser(response.data.user);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

 
  const login = async (credentials) => {
    try {
      setError('');
      const response = await authAPI.login(credentials);
      setCurrentUser(response.data.user);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

 
  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
      setCurrentUser(null);
      setError('');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      setError('');
      await authAPI.forgotPassword(email);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Password reset failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Reset password function
  const resetPassword = async (token, newPassword) => {
    try {
      setError('');
      await authAPI.resetPassword(token, newPassword);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Password reset failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const clearError = () => {
    setError('');
  };




  const value = {
    currentUser,
    error,
    loading,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    checkAuthStatus,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};