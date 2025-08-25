import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return {
    currentUser: context.currentUser, 
    logout: context.logout,
    loading: context.loading,
    login: context.login,
    register: context.register,
    error: context.error,
    clearError: context.clearError
  };
};


export default useAuth