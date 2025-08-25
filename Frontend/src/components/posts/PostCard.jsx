import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowUp, ArrowDown, Share, Bookmark } from 'lucide-react';
import VotingWidget from '../ui/VotingWidget';
import { formatDistanceToNow } from '../../utils/formatters';

const PostCard = ({ post, expanded = false, onComment }) => {
  
  if (!post) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md overflow-hidden p-6"
      >
        <div className="animate-pulse">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-16 bg-gray-200 rounded"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const handleCommentClick = () => {
    if (onComment) {
      onComment();
    }
  };

  // Safely access nested properties with fallbacks
  const communityId = post.community?._id || 'unknown';
  const communityName = post.community?.name || 'Unknown Community';
  const authorName = post.author?.name || 'Unknown Author';
  const createdAt = post.createdAt ? formatDistanceToNow(post.createdAt) : 'Some time ago';
  const commentCount = post.commentCount || 0;
  const votes = post.votes || 0;
  const userVote = post.userVote || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start space-x-3">
          <VotingWidget 
            postId={post._id || 'unknown'} 
            votes={votes} 
            userVote={userVote} 
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span>Posted in </span>
              <Link 
                to={`/c/${communityId}`}
                className="ml-1 font-medium text-blue-600 hover:text-blue-800"
              >
                {communityName}
              </Link>
              <span className="mx-2">•</span>
              <span>by {authorName}</span>
              <span className="mx-2">•</span>
              <span>{createdAt}</span>
            </div>
            
            <Link to={expanded ? '#' : `/post/${post.id || 'unknown'}`}>
              <h2 className={`font-semibold text-gray-900 hover:text-blue-600 ${expanded ? 'text-2xl mb-4' : 'text-xl mb-3'}`}>
                {post.title || 'Untitled Post'}
              </h2>
            </Link>
            
            {post.content && (
              <div className="prose prose-sm max-w-none text-gray-700 mb-4">
                {expanded ? (
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                ) : (
                  <p className="line-clamp-3">{post.content.replace(/<[^>]*>/g, '')}</p>
                )}
              </div>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <button
                onClick={handleCommentClick}
                className="flex items-center space-x-1 hover:text-blue-600"
              >
                <MessageSquare size={16} />
                <span>{commentCount} comments</span>
              </button>
              
              <button className="flex items-center space-x-1 hover:text-blue-600">
                <Share size={16} />
                <span>Share</span>
              </button>
              
              <button className="flex items-center space-x-1 hover:text-blue-600">
                <Bookmark size={16} />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;