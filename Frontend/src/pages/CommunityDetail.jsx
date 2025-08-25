import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import CommunityHeader from '../components/community/CommunityHeader';
import PostForm from '../components/posts/PostForm';
import PostList from '../components/posts/PostList';
import { useCommunities } from '../hooks/useCommunities';
import { usePosts } from '../hooks/usePosts';

const CommunityDetail = () => {
  const { communityId } = useParams();
  const [showPostForm, setShowPostForm] = useState(false);
  const [postFilter, setPostFilter] = useState('latest');
  
  const { community, loading: communityLoading, error: communityError } = useCommunities(communityId);
  const { posts, loading: postsLoading, error: postsError } = usePosts(postFilter, communityId);

  if (communityError) {
    return <div>Error loading community: {communityError.message}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <CommunityHeader 
        community={community} 
        loading={communityLoading}
        onJoin={() => console.log('Join community')}
        onCreatePost={() => setShowPostForm(true)}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showPostForm && (
          <PostForm 
            communityId={communityId}
            onCancel={() => setShowPostForm(false)}
            onSuccess={() => setShowPostForm(false)}
          />
        )}
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Community Discussions</h2>
          <select 
            value={postFilter}
            onChange={(e) => setPostFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="latest">Latest</option>
            <option value="popular">Popular</option>
            <option value="top">Top</option>
          </select>
        </div>
        
        <PostList 
          posts={posts} 
          loading={postsLoading} 
          error={postsError}
        />
      </div>
    </div>
  );
};

export default CommunityDetail;