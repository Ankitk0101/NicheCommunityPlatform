import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Bookmark,
  Plus,
  Edit,
  Trash2,
  X,
  Image,
  Video,
  Send,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { usePosts } from '../hooks/usePosts';
import { feedAPI } from '../services/api/feed';
import { communityAPI } from '../services/api/communities';
import { useAuth } from '../hooks/useAuth';
import { commentAPI } from '../services/api/comments';
import { useWebSocket } from '../hooks/useWebSocket';
import { socketService } from '../services/socket';

const Feed = () => {
  const [activeTab, setActiveTab] = useState('latest');
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    hasMore: false
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    community: ''
  });
  const [userCommunities, setUserCommunities] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [commentTexts, setCommentTexts] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  const [postComments, setPostComments] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const fileInputRef = useRef(null);
  const observer = useRef();

  const { votePost, createPost, updatePost, deletePost } = usePosts();
  const { currentUser } = useAuth();
  const { socket, isConnected, subscribe, unsubscribe } = useWebSocket();
   console.log(currentUser)
  // Initialize WebSocket connection with auth token
  useEffect(() => {
    if (currentUser) {
      //socketService.setToken(currentUser.token);
      socketService.connect();
    }
    
    return () => {
      socketService.disconnect();
    };
  }, [currentUser]);

  // Check if current user is the post author
  const isPostAuthor = (post) => {
    if (!currentUser || !post.author) return false;
    
    const authorId = post.author._id || post.author.id || post.author;
    const userId = currentUser.user_id || currentUser.user._id;
    
    return authorId === userId;
  };

  // Check if current user is the comment author
  const isCommentAuthor = (comment) => {
    if (!currentUser || !comment.author) return false;
    
    const authorId = comment.author._id || comment.author.id || comment.author;
    const userId = currentUser.user._id || currentUser.user_id;
    
    return authorId === userId;
  };

  // Infinite scroll observer
  const lastPostElementRef = useCallback(node => {
    if (isLoading || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination.hasMore) {
        loadMorePosts();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, isFetchingMore, pagination.hasMore]);

  // Fetch feed data
  const fetchFeedData = async (page = 1, sortBy = 'new') => {
    try {
      setIsLoading(true);
      setError(null);

      let feedResponse;
      if (activeTab === 'explore') {
        feedResponse = await feedAPI.getExploreFeed({ 
          page, 
          limit: 10,
          sortBy: sortBy === 'latest' ? 'new' : sortBy
        });
      } else {
        feedResponse = await feedAPI.getFeed({ 
          page, 
          limit: 10,
          sortBy: sortBy === 'latest' ? 'new' : sortBy
        });
      }

      const { posts: feedPosts, currentPage, totalPages, totalPosts, hasMore } = feedResponse.data;
      
      if (page === 1) {
        setPosts(feedPosts);
      } else {
        setPosts(prev => [...prev, ...feedPosts]);
      }

      setPagination({
        currentPage,
        totalPages,
        totalPosts,
        hasMore
      });

      // Fetch user's joined communities for post creation
      const userCommunitiesResponse = await communityAPI.getCommunities();
      setUserCommunities(userCommunitiesResponse.data);

    } catch (err) {
      console.error('Failed to fetch feed:', err);
      setError(err.response?.data?.message || 'Failed to load feed');
    } finally {
      setIsLoading(false);
    }
  };

  // Load more posts for infinite scroll
  const loadMorePosts = async () => {
    if (isFetchingMore || !pagination.hasMore) return;
    
    try {
      setIsFetchingMore(true);
      const nextPage = pagination.currentPage + 1;
      
      let feedResponse;
      if (activeTab === 'explore') {
        feedResponse = await feedAPI.getExploreFeed({ 
          page: nextPage, 
          limit: 10,
          sortBy: activeTab === 'latest' ? 'new' : activeTab
        });
      } else {
        feedResponse = await feedAPI.getFeed({ 
          page: nextPage, 
          limit: 10,
          sortBy: activeTab === 'latest' ? 'new' : activeTab
        });
      }
      
      const { posts: newPosts, currentPage, totalPages, totalPosts, hasMore } = feedResponse.data;
      
      setPosts(prev => [...prev, ...newPosts]);
      setPagination({
        currentPage,
        totalPages,
        totalPosts,
        hasMore
      });
    } catch (err) {
      console.error('Failed to load more posts:', err);
      setError('Failed to load more posts');
    } finally {
      setIsFetchingMore(false);
    }
  };
  
  // Handle post voting
  const handleVote = async (postId, voteType) => {
    try {
      const result = await votePost(postId, voteType);
      
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            upvotes: result.upvotes || post.upvotes,
            downvotes: result.downvotes || post.downvotes,
            userVote: result.userVote
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Failed to vote:', err);
      setError(err.response?.data?.message || 'Failed to vote on post');
    }
  };

  // Handle post deletion
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await deletePost(postId);
      setPosts(prev => prev.filter(post => post._id !== postId));
      setError(null);
      setSuccessMessage('Post deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to delete post:', err);
      setError(err.response?.data?.message || 'Failed to delete post');
    }
  };

  // Handle post editing
 const handleEditPost = (post) => {
  setEditingPost(post);
  setFormData({
    title: post.title,
    content: post.content,
    community: post.community?._id || post.community
  });
  setIsCreateModalOpen(true);
};

  // Handle file uploads
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
      const maxSize = 50 * 1024 * 1024;  
      
      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Please upload images or videos.');
        return false;
      }
      
      if (file.size > maxSize) {
        setError('File size too large. Maximum size is 50MB.');
        return false;
      }
      
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  // Remove uploaded file
  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle post submission with files
 // Handle post submission with files (Create + Edit)
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setIsUploading(true);
    setError(null);

    if (editingPost) {
      // Update Post
      const response = await updatePost(editingPost._id, {
        title: formData.title,
        content: formData.content,
        communityId: formData.community
      });

      const updatedPost = response.post;

      setPosts(prev =>
        prev.map(p =>
          p._id === updatedPost._id ? updatedPost : p
        )
      );

      setSuccessMessage("Post updated successfully ✅");
    } else {
      // Create Post
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("communityId", formData.community);

      uploadedFiles.forEach(file => {
        formDataToSend.append("media", file);
      });

      const response = await createPost(formDataToSend);
      const newPost = response.post;

      setPosts(prev => [newPost, ...prev]);

      setSuccessMessage("Post created successfully 🚀");
    }

    // Reset form + close modal
    setFormData({ title: "", content: "", community: "" });
    setUploadedFiles([]);
    setEditingPost(null);
    setIsCreateModalOpen(false);

    setTimeout(() => setSuccessMessage(null), 3000);

  } catch (err) {
    console.error("Failed to submit post:", err);
    setError(err.response?.data?.message || "Failed to submit post");
  } finally {
    setIsUploading(false);
  }
};


  // Toggle comments visibility
  const toggleComments = async (postId) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      if (!postComments[postId]) {
        try {
          const response = await commentAPI.getComments(postId);
          setPostComments(prev => ({
            ...prev,
            [postId]: response.data.comments || response.data
          }));
        } catch (err) {
          console.error('Failed to fetch comments:', err);
          setError('Failed to load comments');
        }
      }
    }
  };

  // Handle comment submission
  const handleAddComment = async (postId) => {
    const content = commentTexts[postId] || '';
    if (!content.trim()) return;

    try {
      setCommentLoading(prev => ({ ...prev, [postId]: true }));
      
      const commentData = {
        postId: postId,
        content: content.trim(),
        parentComment: null
      };

      const response = await commentAPI.createComment(commentData);

      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { ...post, commentCount: (post.commentCount || 0) + 1 }
          : post
      ));

      setPostComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), response.data.comment || response.data]
      }));

      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      setError(null);
    } catch (err) {
      console.error('Failed to add comment:', err);
      setError(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setCommentLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Handle comment editing
  const handleEditComment = async (commentId, postId, newContent) => {
    try {
      const response = await commentAPI.updateComment(commentId, {
        content: newContent
      });

      setPostComments(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).map(comment =>
          comment._id === commentId ? response.data.comment || response.data : comment
        )
      }));

      setEditingCommentId(null);
      setEditCommentText('');
      setError(null);
      
      setSuccessMessage('Comment updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to edit comment:', err);
      setError('Failed to edit comment');
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId, postId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentAPI.deleteComment(commentId);

      setPosts(prev => prev.map(post =>
        post._id === postId
          ? { ...post, commentCount: Math.max(0, (post.commentCount || 0) - 1) }
          : post
      ));

      setPostComments(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(comment => comment._id !== commentId)
      }));

      setError(null);
      
      setSuccessMessage('Comment deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setError('Failed to delete comment');
    }
  };

  // Handle comment text change
  const handleCommentChange = (postId, text) => {
    setCommentTexts(prev => ({ ...prev, [postId]: text }));
  };

  // Handle real-time updates via WebSocket
  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('WebSocket not connected, attempting to reconnect...');
      return;
    }

    console.log('Setting up WebSocket listeners for feed');

    const handleNewComment = (data) => {
      console.log('New comment received via WebSocket:', data);
      setPostComments(prev => ({
        ...prev,
        [data.post]: [...(prev[data.post] || []), data.comment]
      }));

      setPosts(prev => prev.map(post =>
        post._id === data.post
          ? { ...post, commentCount: (post.commentCount || 0) + 1 }
          : post
      ));
    };

    const handleUpdateComment = (data) => {
      console.log('Comment update received via WebSocket:', data);
      setPostComments(prev => ({
        ...prev,
        [data.post]: (prev[data.post] || []).map(comment =>
          comment._id === data.comment._id ? data.comment : comment
        )
      }));
    };

    const handleDeleteComment = (data) => {
      console.log('Comment delete received via WebSocket:', data);
      setPostComments(prev => ({
        ...prev,
        [data.post]: (prev[data.post] || []).filter(comment => comment._id !== data.commentId)
      }));

      setPosts(prev => prev.map(post =>
        post._id === data.post
          ? { ...post, commentCount: Math.max(0, (post.commentCount || 0) - 1) }
          : post
      ));
    };

    const handleNewPost = (data) => {
      console.log('New post received via WebSocket:', data);
      setPosts(prev => [data.post, ...prev]);
    };

  const handleUpdatePost = async () => {
  try {
    const response = await updatePost(editingPost._id, formData); // API call
    const updatedPost = response.data.post; // backend se return hua updated post

    setPosts(prevPosts =>
      prevPosts.map(p =>
        p._id === updatedPost._id ? updatedPost : p
      )
    );

    setIsCreateModalOpen(false);
    setEditingPost(null);
  } catch (err) {
    console.error("Error updating post:", err);
  }
};


    const handleDeletePost = (data) => {
      console.log('Post delete received via WebSocket:', data);
      setPosts(prev => prev.filter(post => post._id !== data.postId));
    };

    const handlePostVote = (data) => {
      console.log('Post vote received via WebSocket:', data);
      setPosts(prev => prev.map(post => {
        if (post._id === data.postId) {
          return {
            ...post,
            upvotes: data.upvotes,
            downvotes: data.downvotes,
            userVote: data.userVote
          };
        }
        return post;
      }));
    };

    // Add error listener
    const handleError = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error. Please refresh the page.');
    };

    // Subscribe to events
    subscribe('newComment', handleNewComment);
    subscribe('updateComment', handleUpdateComment);
    subscribe('deleteComment', handleDeleteComment);
    subscribe('newPost', handleNewPost);
    subscribe('updatePost', handleUpdatePost);
    subscribe('deletePost', handleDeletePost);
    subscribe('postVote', handlePostVote);
    subscribe('error', handleError);

    return () => {
      // Unsubscribe from events
      unsubscribe('newComment', handleNewComment);
      unsubscribe('updateComment', handleUpdateComment);
      unsubscribe('deleteComment', handleDeleteComment);
      unsubscribe('newPost', handleNewPost);
      unsubscribe('updatePost', handleUpdatePost);
      unsubscribe('deletePost', handleDeletePost);
      unsubscribe('postVote', handlePostVote);
      unsubscribe('error', handleError);
    };
  }, [socket, isConnected, subscribe, unsubscribe]);

  // Refresh feed when tab changes
  useEffect(() => {
    fetchFeedData(1, activeTab);
  }, [activeTab]);

  if (isLoading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl p-6 mb-6 border border-gray-100"
                >
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-3 mb-4">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                    <div className="flex space-x-4">
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
          >
            {error}
            <button 
              onClick={() => setError(null)} 
              className="ml-4 text-red-800 hover:text-red-900"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
        
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
          >
            {successMessage}
            <button 
              onClick={() => setSuccessMessage(null)} 
              className="ml-4 text-green-800 hover:text-green-900"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}

        {/* WebSocket Connection Status */}
        {/* <div className={`fixed top-20 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
         */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed Content */}
          <div className="lg:col-span-3">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Your Feed</h2>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                  <span>Create Post</span>
                </button>
              </div>
              
              {/* Feed Tabs */}
              <div className="flex space-x-4 border-b border-gray-100 pb-4">
                {['latest', 'popular', 'explore'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 capitalize ${
                      activeTab === tab
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-blue-50 rounded-lg -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Posts */}
              <div className="mt-6 space-y-6">
                {posts.length === 0 && !isLoading ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-4">
                      No posts found
                    </div>
                    <p className="text-gray-500">
                      {activeTab === 'explore' 
                        ? 'Explore more communities to see posts here' 
                        : 'Join some communities to see posts in your feed'
                      }
                    </p>
                  </div>
                ) : (
                  <>
                    {posts.map((post, index) => (
                      <motion.div
                        key={post._id}
                        ref={index === posts.length - 1 ? lastPostElementRef : null}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300 relative"
                      >
                        

                        {/* Edit/Delete buttons for post owner */}
                        {currentUser.user._id && isPostAuthor(post) && (
                          <div className="absolute top-4 right-4 flex space-x-2">
                            <button
                              onClick={() => handleEditPost(post)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
                              title="Edit post"
                            >
                              <Edit size={16} className="mr-1" />
                              <span className="text-sm">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeletePost(post._id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                              title="Delete post"
                            >
                              <Trash2 size={16} className="mr-1" />
                              <span className="text-sm">Delete</span>
                            </button>
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <span>Posted in {post.community?.name}</span>
                          <span className="mx-2">•</span>
                          <span>by {post.author?.displayName || post.author?.username || 'Unknown user'}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 whitespace-pre-line">
                          {post.content}
                        </p>

                        {/* Media Display */}
                        {post.media && post.media.length > 0 && (
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {post.media.map((media, index) => (
                              <div key={index} className="rounded-lg overflow-hidden">
                                {media.type === 'image' ? (
                                  <img
                                    src={media.url}
                                    alt={`Post media ${index}`}
                                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(media.url, '_blank')}
                                  />
                                ) : (
                                  <video
                                    controls
                                    className="w-full h-48 object-cover"
                                    poster={media.thumbnail || ''}
                                  >
                                    <source src={media.url} type={`video/${media.url.split('.').pop()}`} />
                                    Your browser does not support the video tag.
                                  </video>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
                          {/* Upvote button */}
                          <button 
                            onClick={() => handleVote(post._id, 'up')}
                            className={`flex items-center space-x-1 transition-colors ${
                              post.userVote === 'up' 
                                ? 'text-green-400' 
                                : 'hover:text-green-300'
                            }`}
                            title="Upvote"
                          >
                            <ThumbsUp size={18} />
                            <span>{post.upvotes || 0}</span>
                          </button>
                          
                          {/* Downvote button */}
                          <button 
                            onClick={() => handleVote(post._id, 'down')}
                            className={`flex items-center space-x-1 transition-colors ${
                              post.userVote === 'down' 
                                ? 'text-blue-500' 
                                : 'hover:text-blue-500'
                            }`}
                            title="Downvote"
                          >
                            <ThumbsDown size={18} />
                            <span>{post.downvotes || 0}</span>
                          </button>
                          
                          {/* Comments button */}
                          <button 
                            onClick={() => toggleComments(post._id)}
                            className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
                            title="Comments"
                          >
                            <MessageSquare size={18} />
                            <span>{post.commentCount || 0} comments</span>
                          </button>
                          
                          <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors ml-auto" title="Save">
                            <Bookmark size={18} />
                            <span>Save</span>
                          </button>
                        </div>

                        {/* Comments Section */}
                        {expandedPostId === post._id && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <h4 className="font-medium text-gray-800 mb-3">Comments</h4>
                            
                            {/* Comment form */}
                            <div className="flex space-x-2 mb-4">
                              <input
                                type="text"
                                value={commentTexts[post._id] || ''}
                                onChange={(e) => handleCommentChange(post._id, e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                              />
                              <button
                                onClick={() => handleAddComment(post._id)}
                                disabled={commentLoading[post._id] || !commentTexts[post._id]?.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                              >
                                <Send size={18} />
                              </button>
                            </div>

                            {/* Comments list */}
                            <div className="space-y-3">
                              {postComments[post._id] && postComments[post._id].length > 0 ? (
                                postComments[post._id].map(comment => (
                                  <div key={comment._id} className="flex items-start space-x-3 group relative">
                                    <img
                                      src={comment.author?.profilePicture || '/default-avatar.png'}
                                      alt={comment.author?.username}
                                      className="w-8 h-8 rounded-full flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      {editingCommentId === comment._id ? (
                                        <div className="flex space-x-2">
                                          <input
                                            type="text"
                                            value={editCommentText}
                                            onChange={(e) => setEditCommentText(e.target.value)}
                                            className="flex-1 px-3 py-1 border border-gray-300 rounded-lg"
                                            autoFocus
                                          />
                                          <button
                                            onClick={() => handleEditComment(comment._id, post._id, editCommentText)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded-lg"
                                          >
                                            Save
                                          </button>
                                          <button
                                            onClick={() => setEditingCommentId(null)}
                                            className="px-3 py-1 bg-gray-300 rounded-lg"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="bg-gray-100 rounded-lg p-3">
                                            <p className="font-medium text-sm">{comment.author?.username}</p>
                                            <p className="text-gray-700">{comment.content}</p>
                                          </div>
                                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            {comment.isEdited && <span>(edited)</span>}
                                            {currentUser.user._id && isCommentAuthor(comment) && (
                                              <>
                                                <button 
                                                  onClick={() => {
                                                    setEditingCommentId(comment._id);
                                                    setEditCommentText(comment.content);
                                                  }}
                                                  className="hover:text-green-600"
                                                >
                                                  Edit
                                                </button>
                                                <button 
                                                  onClick={() => handleDeleteComment(comment._id, post._id)}
                                                  className="hover:text-red-600"
                                                >
                                                  Delete
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                    
                    {isFetchingMore && (
                      <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-gray-500 mt-2">Loading more posts...</p>
                      </div>
                    )}
                    
                    {!pagination.hasMore && posts.length > 0 && (
                      <div className="text-center py-4">
                        <p className="text-gray-500">You've reached the end of the feed</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Create/Edit Post Modal with File Upload */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => !isUploading && setIsCreateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingPost ? 'Edit Post' : 'Create Post'}
                </h3>
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingPost(null);
                    setFormData({ title: '', content: '', community: '' });
                    setUploadedFiles([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isUploading}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!editingPost && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Community
                    </label>
                    <select
                      name="community"
                      value={formData.community}
                      onChange={(e) => setFormData(prev => ({ ...prev, community: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isUploading}
                    >
                      <option value="">Select a community</option>
                      {userCommunities.map(community => (
                        <option key={community._id} value={community._id}>
                          {community.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter post title"
                    disabled={isUploading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What's on your mind?"
                    disabled={isUploading}
                  />
                </div>

                {!editingPost && (
                  <>
                    {/* File Upload Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Add Media (Images/Videos)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          multiple
                          accept="image/*,video/*"
                          className="hidden"
                          disabled={isUploading}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-col items-center justify-center w-full p-6 text-gray-400 hover:text-gray-600 transition-colors"
                          disabled={isUploading}
                        >
                          <Image size={48} className="mb-2" />
                          <p>Click to upload images or videos</p>
                          <p className="text-sm text-gray-500">Max 50MB per file</p>
                        </button>
                      </div>
                      
                      {/* Uploaded files preview */}
                      {uploadedFiles.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="relative group">
                              {file.type.startsWith('image/') ? (
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <Video size={32} className="text-gray-400" />
                                  <span className="ml-2 text-sm text-gray-600">
                                    {file.name}
                                  </span>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                disabled={isUploading}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setEditingPost(null);
                      setFormData({ title: '', content: '', community: '' });
                      setUploadedFiles([]);
                    }}
                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </div>
                    ) : (
                      editingPost ? 'Update Post' : 'Create Post'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Feed;