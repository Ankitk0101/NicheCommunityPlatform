import { useState } from 'react';
import { motion } from 'framer-motion';
import CommunityCard from './CommunityCard';
import { Grid, List } from 'lucide-react';

const CommunityList = ({ 
  communities, 
  loading, 
  error, 
  layout = 'grid',
  onJoin, 
  onLeave, 
  onEdit, 
  onDelete,
  currentUserId,
  isCommunityCreator 
}) => {
  const [viewMode, setViewMode] = useState(layout);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-4">No communities found</div>
        <p className="text-gray-500">
          Try adjusting your search or filters to find more communities
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* View Mode Toggle */}
      <div className="flex justify-end mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Communities Grid/List */}
      <div className={viewMode === 'grid' ? 
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
        "space-y-4"
      }>
        {communities.map((community, index) => (
          <motion.div
            key={community._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <CommunityCard
              community={community}
              index={index}
              onJoin={onJoin}
              onLeave={onLeave}
              onEdit={onEdit}
              onDelete={onDelete}
              currentUserId={currentUserId}
              isCommunityCreator={isCommunityCreator}
              layout={viewMode}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CommunityList;