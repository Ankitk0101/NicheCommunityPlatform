import api from './base';

export const postAPI = {
 
  getPosts: (params) => api.get('/posts', { params }),
  

  getPost: (id) => api.get(`/posts/${id}`),
  
 
  createPost: (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    return api.post('/posts', formData, config);
  },
  
 
  updatePost: (id, formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    return api.put(`/posts/${id}`, formData, config);
  },
  
  deletePost: (id) => api.delete(`/posts/${id}`),
  
  votePost: (id, voteType) => api.post(`/posts/${id}/vote`, voteType),

  searchPosts: (query) => api.get('/posts/search', { params: { q: query } }),
  
  getUserPosts: (userId) => api.get(`/posts/user/${userId}`),
};