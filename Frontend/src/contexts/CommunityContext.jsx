import React, { createContext, useContext, useState } from 'react';

const CommunityContext = createContext();

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};

export const CommunityProvider = ({ children }) => {
  const [currentCommunity, setCurrentCommunity] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);

  const joinCommunity = async (communityId) => {
    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        // Update user communities
        const updatedCommunities = await response.json();
        setUserCommunities(updatedCommunities);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error joining community:', error);
      return false;
    }
  };

  const leaveCommunity = async (communityId) => {
    try {
      const response = await fetch(`/api/communities/${communityId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        // Update user communities
        const updatedCommunities = await response.json();
        setUserCommunities(updatedCommunities);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error leaving community:', error);
      return false;
    }
  };

  const value = {
    currentCommunity,
    setCurrentCommunity,
    communities,
    setCommunities,
    userCommunities,
    setUserCommunities,
    joinCommunity,
    leaveCommunity
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
};