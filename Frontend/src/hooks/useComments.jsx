import { useState, useEffect } from 'react';
import { commentAPI } from '../services/api/comments';
import { useWebSocket } from './useWebSocket';

export const useComments = (postId) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { socket, subscribe, unsubscribe } = useWebSocket();

  const fetchComments = async (params = {}) => {
    try {
      setLoading(true);
      const response = await commentAPI.getComments(postId, params);
      setComments(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch comments');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createComment = async (commentData) => {
    try {
      const response = await commentAPI.createComment(commentData);
      setComments(prev => [response.data, ...prev]);
      
      // Emit socket event for real-time update
      if (socket) {
        socket.emit('newComment', {
          postId: commentData.post,
          comment: response.data
        });
      }
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create comment');
      throw err;
    }
  };

  const voteComment = async (commentId, voteType) => {
    try {
      await commentAPI.voteComment(commentId, voteType);
      // Update local state
      setComments(prev => prev.map(comment => {
        if (comment._id === commentId) {
          const newUpvotes = voteType === 'up' ? comment.upvotes + 1 : comment.upvotes;
          const newDownvotes = voteType === 'down' ? comment.downvotes + 1 : comment.downvotes;
          return { 
            ...comment, 
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            userVote: voteType 
          };
        }
        return comment;
      }));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to vote on comment');
      throw err;
    }
  };

  // Subscribe to real-time comment updates
  useEffect(() => {
    if (!socket || !postId) return;

    const handleNewComment = (newComment) => {
      if (newComment.post === postId) {
        setComments(prev => [newComment, ...prev]);
      }
    };

    subscribe('newComment', handleNewComment);

    return () => {
      unsubscribe('newComment', handleNewComment);
    };
  }, [socket, postId, subscribe, unsubscribe]);

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  return {
    comments,
    loading,
    error,
    fetchComments,
    createComment,
    voteComment,
    refetch: fetchComments,
  };
};