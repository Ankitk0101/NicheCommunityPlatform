import { motion } from 'framer-motion';
import { Users, Bell, Edit3 } from 'lucide-react';

const CommunityHeader = ({ community, loading, onJoin, onCreatePost }) => {
  if (loading) {
    return (
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
            <div className="flex space-x-4">
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{community.name}</h1>
            <p className="text-gray-600 mb-6">{community.description}</p>
          </div>
          
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            {community.name.charAt(0)}
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
          <div className="flex items-center space-x-1">
            <Users size={16} />
            <span>{community.memberCount.toLocaleString()} members</span>
          </div>
          <span>•</span>
          <span>Created {new Date(community.createdAt).toLocaleDateString()}</span>
        </div>
        
        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onJoin}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              community.isMember
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {community.isMember ? 'Joined' : 'Join Community'}
          </motion.button>
          
          {community.isMember && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCreatePost}
                className="px-6 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Edit3 size={16} />
                <span>Create Post</span>
              </motion.button>
              
              <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg">
                <Bell size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CommunityHeader;