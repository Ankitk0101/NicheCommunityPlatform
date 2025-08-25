import { useState } from 'react';
import { motion } from 'framer-motion';
import PostList from '../components/posts/PostList';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const { user } = useAuth();
  const { posts, loading: postsLoading } = usePosts('user');

  const tabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'comments', label: 'Comments' },
    { id: 'communities', label: 'Communities' },
    { id: 'saved', label: 'Saved' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Profile Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold"
            >
              {user?.name?.charAt(0) || 'U'}
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.name || 'User'}</h1>
              <p className="text-gray-600">@{user?.username || 'username'}</p>
              <div className="flex space-x-4 mt-2">
                <div>
                  <span className="font-semibold">245</span>
                  <span className="text-gray-600 ml-1">Posts</span>
                </div>
                <div>
                  <span className="font-semibold">1.2k</span>
                  <span className="text-gray-600 ml-1">Comments</span>
                </div>
                <div>
                  <span className="font-semibold">18</span>
                  <span className="text-gray-600 ml-1">Communities</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'posts' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Posts</h2>
            <PostList posts={posts} loading={postsLoading} />
          </motion.div>
        )}
        
        {activeTab === 'comments' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Comments</h2>
            {/* Comments list would go here */}
          </motion.div>
        )}
        
        {activeTab === 'communities' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Communities</h2>
            {/* Communities list would go here */}
          </motion.div>
        )}
        
        {activeTab === 'saved' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Saved Content</h2>
            {/* Saved content would go here */}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;