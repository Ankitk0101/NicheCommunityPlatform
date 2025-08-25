import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL:  'https://nichecommunityplatform-1.onrender.com',
  withCredentials: true,  
});

// Request interceptor (no need to manually add token for cookies)
api.interceptors.request.use(
  (config) => {
   
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

 
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/reset-password')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);


export default api;