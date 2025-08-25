import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import PostCard from '../components/posts/PostCard';
import CommentList from '../components/comments/CommentList';
import CommentForm from '../components/comments/CommentForm';
import { usePosts } from '../hooks/usePosts';

const PostDetail = () => {
  const { postId } = useParams();
  const { post, loading, error } = usePosts(postId);
  const [isCommenting, setIsCommenting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-red-500">Error loading post: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Post */}
        {post && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <PostCard 
              post={post} 
              expanded={true}
              onComment={() => setIsCommenting(true)}
            />
          </motion.div>
        )}

        {/* Comment Form */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <CommentForm 
            postId={postId}
            onCancel={() => setIsCommenting(false)}
            onSuccess={() => setIsCommenting(false)}
            autoFocus={isCommenting}
          />
        </motion.div>

        {/* Comments */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Comments</h3>
          <CommentList postId={postId} />
        </motion.div>
      </div>
    </div>
  );
};

export default PostDetail;