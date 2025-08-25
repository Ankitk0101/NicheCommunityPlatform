import { motion } from 'framer-motion';
import { useCommunities } from '../../hooks/useCommunities';

const Sidebar = () => {
  const { communities, loading } = useCommunities('user');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Communities</h2>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {communities.slice(0, 5).map(community => (
            <div key={community._id} className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {community.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-gray-700">{community.name}</span>
            </div>
          ))}
          
          {communities.length === 0 && (
            <p className="text-sm text-gray-500">You haven't joined any communities yet.</p>
          )}
          
          {communities.length > 5 && (
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2">
              View all communities
            </button>
          )}
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Trending Topics</h3>
        <div className="space-y-2">
          {['Technology', 'Gaming', 'Art', 'Science', 'Sports'].map(topic => (
            <div key={topic} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">#{topic}</span>
              <span className="text-xs text-gray-400">342 posts</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;