// src/hooks/usePosts.js
import { useState, useEffect } from 'react';
import { postAPI } from '../services/api/posts';
import { useAuth } from './useAuth';

export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  const createPost = async (formData) => {
    try {
      setLoading(true);
      const response = await postAPI.createPost(formData);
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Create post error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to create post');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (postId, postData) => {
    try {
      setLoading(true);
      const response = await postAPI.updatePost(postId, postData);
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Update post error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to update post');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId) => {
    try {
      setLoading(true);
      await postAPI.deletePost(postId);
      setError(null);
      return true;
    } catch (err) {
      console.error('Delete post error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to delete post');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const votePost = async (postId, voteType) => {
    try {
      const response = await postAPI.votePost(postId, { voteType });
      return response.data;
    } catch (err) {
      console.error('Vote post error:', err.response?.data);
      throw err;
    }
  };

  const fetchPosts = async (params = {}) => {
    try {
      setLoading(true);
      const response = await postAPI.getPosts(params);
      setPosts(response.data.posts || response.data);
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Fetch posts error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to fetch posts');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    votePost,
    fetchPosts,
    refetch: fetchPosts,
  };
};