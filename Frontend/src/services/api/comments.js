import api from './base';

export const commentAPI = {
  // Get comments for a post
  getComments: (postId, params) => api.get(`/comments/post/${postId}`, { params }),
  
 
  createComment: (data) => api.post('/comments', data),
  
  // Update comment
  updateComment: (id, data) => api.put(`/comments/${id}`, data),
  
  // Delete comment
  deleteComment: (id) => api.delete(`/comments/${id}`),
  
  // Vote on comment
  voteComment: (id, voteType) => api.post(`/comments/${id}/vote`, { voteType }),
  
  // Get comment replies
  getReplies: (commentId) => api.get(`/comments/${commentId}/replies`),
};
