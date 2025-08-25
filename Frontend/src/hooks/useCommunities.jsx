import { useState, useEffect } from 'react';
import { communityAPI } from '../services/api/communities';

export const useCommunities = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCommunities = async (params = {}) => {
    try {
      setLoading(true);
      const response = await communityAPI.getCommunities(params);
      setCommunities(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch communities');
    } finally {
      setLoading(false);
    }
  };

  const joinCommunity = async (communityId) => {
    try {
      const response = await communityAPI.joinCommunity(communityId);
      setCommunities(prev => prev.map(comm => 
        comm._id === communityId ? { ...comm, isMember: true, memberCount: comm.memberCount + 1 } : comm
      ));
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to join community');
    }
  };

  const leaveCommunity = async (communityId) => {
    try {
      const response = await communityAPI.leaveCommunity(communityId);
      setCommunities(prev => prev.map(comm => 
        comm._id === communityId ? { ...comm, isMember: false, memberCount: Math.max(0, comm.memberCount - 1) } : comm
      ));
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to leave community');
    }
  };

  const createCommunity = async (communityData) => {
    try {
      const response = await communityAPI.createCommunity(communityData);
      setCommunities(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create community');
    }
  };

  const updateCommunity = async (communityId, communityData) => {
    try {
      const response = await communityAPI.updateCommunity(communityId, communityData);
      setCommunities(prev => prev.map(comm => 
        comm._id === communityId ? response.data : comm
      ));
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update community');
    }
  };

  const deleteCommunity = async (communityId) => {
    try {
      await communityAPI.deleteCommunity(communityId);
      setCommunities(prev => prev.filter(comm => comm._id !== communityId));
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete community');
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  return {
    communities,
    loading,
    error,
    fetchCommunities,
    joinCommunity,
    leaveCommunity,
    createCommunity,
    updateCommunity,
    deleteCommunity
  };
};