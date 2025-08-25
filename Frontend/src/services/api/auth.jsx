import api from './base';

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),

  register: (userData) => api.post('/auth/signup', userData),

  logout: () => api.post('/auth/logout'),

  getCurrentUser: () => api.get('/auth/me'),

  forgotPassword: (email) => api.post('/auth/forgot-password',  email ),

  resetPassword: (token, passwordData) => 
    api.post(`/auth/reset-password/${token}`, passwordData),

  validateResetToken: (token) => 
    api.get(`/auth/validate-reset-token/${token}`)
};
