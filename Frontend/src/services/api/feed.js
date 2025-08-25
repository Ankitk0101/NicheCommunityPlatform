import api from './base';

export const feedAPI = {
  
  getFeed: (params) => api.get('/feed', { params }),
  
 
  getExploreFeed: (params) => api.get('/feed/explore', { params }),
  
 
  getRecommendedCommunities: (limit = 10) => 
    api.get('/feed/communities', { params: { limit } }),
  
   
  searchFeed: (query, params) => 
    api.get('/feed/search', { params: { q: query, ...params } }),
};