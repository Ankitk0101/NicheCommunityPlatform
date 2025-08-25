import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Users, TrendingUp, Clock } from 'lucide-react';
import CommunityList from '../components/community/CommunityList';
import CommunityCard from '../components/community/CommunityCard';
import TopicCard from '../components/ui/TopicCard';
import FilterPanel from '../components/ui/FilterPanel';
import { useCommunities } from '../hooks/useCommunities';
import CreateCommunityModal from '../components/community/CreateCommunityModal';
import { useAuth } from '../hooks/useAuth';
import { feedAPI } from '../services/api/feed';

const Communities = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [recommendedCommunities, setRecommendedCommunities] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);

  const { user } = useAuth();
  const {
    communities,
    loading,
    error: apiError,
    fetchCommunities,
    joinCommunity,
    leaveCommunity,
    createCommunity,
    updateCommunity,
    deleteCommunity,
  } = useCommunities();

  // ------- Helpers -------
  const toIdStr = (val) => (val ? String(val) : '');
  const getId = (entity) => entity?._id || entity?.id || entity;
  const currentUserId = toIdStr(user?._id || user?.user_id);

  const getMemberCount = (c) => {
    if (typeof c?.memberCount === 'number') return c.memberCount;
    if (Array.isArray(c?.members)) return c.members.length;
    return 0;
  };

  const isCurrentUserMember = (community) => {
    if (!currentUserId) return false;
    const members = Array.isArray(community?.members) ? community.members : [];
    return members.some((m) => toIdStr(getId(m)) === currentUserId);
  };

  // Check if current user is the community creator (safe for ObjectId/string)
  const isCommunityCreator = (community) => {
    if (!user || !community?.creator) return false;
    const creatorId = toIdStr(getId(community.creator));
    return creatorId === currentUserId;
  };

  const filters = [
    { id: 'all', label: 'All Communities' },
    { id: 'popular', label: 'Popular' },
    { id: 'new', label: 'New' },
    { id: 'growing', label: 'Fast Growing' },
    { id: 'user', label: 'My Communities' },
  ];

  const categories = [
    { id: 'technology', name: 'Technology', color: 'bg-blue-100 text-blue-800' },
    { id: 'gaming', name: 'Gaming', color: 'bg-green-100 text-green-800' },
    { id: 'art', name: 'Art & Design', color: 'bg-purple-100 text-purple-800' },
    { id: 'science', name: 'Science', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'sports', name: 'Sports', color: 'bg-red-100 text-red-800' },
    { id: 'music', name: 'Music', color: 'bg-pink-100 text-pink-800' },
    { id: 'food', name: 'Food', color: 'bg-orange-100 text-orange-800' },
    { id: 'health', name: 'Health & Fitness', color: 'bg-teal-100 text-teal-800' },
  ];

  // Fetch recommended communities + trending tags
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const communitiesResponse = await feedAPI.getRecommendedCommunities(4);
        setRecommendedCommunities(communitiesResponse.data);

        const feedResponse = await feedAPI.getExploreFeed({
          page: 1,
          limit: 20,
          sortBy: 'popular',
        });

        const posts = feedResponse.data.posts || [];
        const tagCounts = {};
        posts.forEach((post) => {
          const hashtags = post.content?.match(/#\w+/g) || [];
          hashtags.forEach((tag) => {
            const cleanTag = tag.toLowerCase();
            tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
          });
        });

        const trending = Object.entries(tagCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([tag, count], index) => ({
            id: index + 1,
            tag,
            posts: `${count}`,
          }));

        setTrendingTopics(trending);
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      }
    };

    fetchRecommendations();
  }, []);

  // Client-side filtering
  const filteredCommunities = communities.filter((community) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (community.name?.toLowerCase().includes(q) ?? false) ||
      (community.description?.toLowerCase().includes(q) ?? false);

    const matchesCategory =
      activeFilter === 'all' || community.category === activeFilter;

    const count = getMemberCount(community);

    switch (activeFilter) {
      case 'popular':
        return matchesSearch && count >= 1000;
      case 'new':
        return matchesSearch && isNewCommunity(community.createdAt);
      case 'growing':
        return matchesSearch && count >= 100 && count < 1000;
      case 'user':
        return matchesSearch && isCurrentUserMember(community);
      default:
        return matchesSearch && matchesCategory;
    }
  });

  function isNewCommunity(createdAt) {
    if (!createdAt) return false;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(createdAt) > oneWeekAgo;
  }

  // ------- Actions (with refresh + optimistic update for sidebar cards) -------
  const handleJoinCommunity = async (communityId) => {
    try {
      await joinCommunity(communityId);

      // Optimistic update for sidebar recommended list
      setRecommendedCommunities((prev) =>
        prev.map((c) =>
          c._id === communityId
            ? {
                ...c,
                isMember: true,
                memberCount: getMemberCount(c) + 1,
              }
            : c
        )
      );

      // Refresh main listing to get accurate state from server
      await fetchCommunities();

      setSuccessMessage('Successfully joined community!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err?.message || 'Failed to join community');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleLeaveCommunity = async (communityId) => {
    try {
      await leaveCommunity(communityId);

      // Optimistic update for sidebar recommended list
      setRecommendedCommunities((prev) =>
        prev.map((c) =>
          c._id === communityId
            ? {
                ...c,
                isMember: false,
                memberCount: Math.max(0, getMemberCount(c) - 1),
              }
            : c
        )
      );

      // Refresh main listing to get accurate state from server
      await fetchCommunities();

      setSuccessMessage('Successfully left community!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err?.message || 'Failed to leave community');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleCreateCommunity = async (communityData) => {
    try {
      await createCommunity(communityData);
      setIsCreateModalOpen(false);
      await fetchCommunities(); // refresh list + counts
      setSuccessMessage('Community created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err?.message || 'Failed to create community');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleUpdateCommunity = async (communityId, communityData) => {
    try {
      await updateCommunity(communityId, communityData);
      setEditingCommunity(null);
      await fetchCommunities(); // refresh
      setSuccessMessage('Community updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err?.message || 'Failed to update community');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDeleteCommunity = async (communityId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this community? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await deleteCommunity(communityId);
      await fetchCommunities(); // refresh list
      setSuccessMessage('Community deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err?.message || 'Failed to delete community');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleEditCommunity = (community) => {
    if (isCommunityCreator(community)) {
      setEditingCommunity(community);
      setIsCreateModalOpen(true);
    } else {
      setError('Only community creators can edit communities');
      setTimeout(() => setError(''), 5000);
    }
  };

  useEffect(() => {
    if (apiError) {
      setError(apiError);
      setTimeout(() => setError(''), 5000);
    }
  }, [apiError]);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
            >
              {successMessage}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Discover Communities
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Find your people and explore communities tailored to your interests
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search communities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Create Community</span>
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <FilterPanel
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    filters={filters}
                  />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 md:hidden"
                >
                  <Filter size={20} />
                  <span>Filters</span>
                </button>
              </div>

              {/* Category Filters */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6"
              >
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Browse by Category</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveFilter(category.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${category.color} hover:opacity-90 ${
                        activeFilter === category.id ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                  <Users className="text-blue-600" size={24} />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {communities.reduce((sum, comm) => sum + getMemberCount(comm), 0).toLocaleString()}
                    </p>
                    <p className="text-gray-600">Total Members</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="text-green-600" size={24} />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {communities.filter((comm) => getMemberCount(comm) > 1000).length}
                    </p>
                    <p className="text-gray-600">Popular Communities</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                  <Clock className="text-purple-600" size={24} />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {communities.filter((c) => isNewCommunity(c.createdAt)).length}
                    </p>
                    <p className="text-gray-600">New This Week</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Community List */}
            <CommunityList
              communities={filteredCommunities}
              loading={loading}
              error={undefined} // local toast hi dikhayenge
              layout="grid"
              onJoin={handleJoinCommunity}
              onLeave={handleLeaveCommunity}
              onEdit={handleEditCommunity}
              onDelete={handleDeleteCommunity}
              currentUserId={currentUserId}
              isCommunityCreator={isCommunityCreator}
            />

            {/* Load More Button */}
            {filteredCommunities.length > 0 && !loading && (
              <div className="text-center mt-12">
                <button
                  onClick={() =>
                    fetchCommunities({ page: Math.ceil(communities.length / 10) + 1 })
                  }
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Load More Communities
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recommended Communities */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="mr-2 w-5 h-5" />
                Recommended Communities
              </h3>

              <div className="space-y-4">
                {recommendedCommunities.map((community, index) => (
                  <CommunityCard
                    key={community._id}
                    community={community}
                    index={index}
                    onJoin={() => handleJoinCommunity(community._id)}
                    onLeave={() => handleLeaveCommunity(community._id)}
                    showActions={true}
                  />
                ))}
              </div>

              <button className="w-full mt-4 text-center text-blue-600 hover:text-blue-700 font-medium">
                View all communities
              </button>
            </motion.div>

            {/* Trending Topics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <TrendingUp className="mr-2 w-5 h-5" />
                Trending Topics
              </h3>

              <div className="space-y-3">
                {trendingTopics.length > 0 ? (
                  trendingTopics.map((topic, index) => (
                    <TopicCard key={topic.id} topic={topic} index={index} />
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No trending topics yet</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Create/Edit Community Modal */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <CreateCommunityModal
              community={editingCommunity}
              onClose={() => {
                setIsCreateModalOpen(false);
                setEditingCommunity(null);
              }}
              onSubmit={
                editingCommunity
                  ? (data) => handleUpdateCommunity(editingCommunity._id, data)
                  : handleCreateCommunity
              }
              categories={categories}
              isEditing={!!editingCommunity}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Communities;
