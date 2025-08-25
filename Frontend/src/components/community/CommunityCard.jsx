import React from 'react';

const CommunityCard = ({ community, index, onJoin, onLeave }) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${community.color || 'from-gray-400 to-gray-600'} flex items-center justify-center text-white font-semibold`}>
          {community.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 className="font-medium text-gray-800">{community.name}</h4>
          <p className="text-sm text-gray-500">
            {community.memberCount?.toLocaleString() || '0'} members
          </p>
        </div>
      </div>
      
      {community.isMember ? (
        <button
          onClick={onLeave}
          className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        >
          Leave
        </button>
      ) : (
        <button
          onClick={onJoin}
          className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
        >
          Join
        </button>
      )}
    </div>
  );
};

export default CommunityCard;