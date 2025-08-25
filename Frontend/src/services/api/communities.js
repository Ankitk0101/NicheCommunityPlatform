import api from './base';

export const communityAPI = {
  getCommunities: (params) => api.get('/community', { params }),
  
  getCommunity: (id) => api.get(`/community/${id}`),
  
  createCommunity: (data) => api.post('/community', data),
  
  updateCommunity: (id, data) => api.put(`/community/${id}`, data),
  
  deleteCommunity: (id) => api.delete(`/community/${id}`),
  
  joinCommunity: (id) => api.post(`/community/${id}/join`),
  
  leaveCommunity: (id) => api.post(`/community/${id}/leave`),
  
  searchCommunities: (query) => api.get('/community/search', { params: { q: query } }),
  
  getSuggestions: () => api.get('/community/suggestions'),
  
  getCommunityMembers: (id) => api.get(`/community/${id}/members`),
  
  updateCommunitySettings: (id, settings) => api.put(`/community/${id}/settings`, settings),
};