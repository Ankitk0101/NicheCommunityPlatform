// src/components/posts/PostCard.jsx
import { motion } from 'framer-motion';
import { useState } from 'react';
// import Voting from './Voting';
// import CommentSection from '../comments/CommentSection';
// import RichTextEditor from '../ui/RichTextEditor';

const PostCard = ({ post }) => {
  const [showComments, setShowComments] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md p-6 mb-4"
    >
      <div className="flex items-start space-x-3">
        {/* <Voting 
          postId={post._id} 
          upvotes={post.upvotes} 
          downvotes={post.downvotes} 
        /> */}
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <img
              src={post.author.avatar}
              alt={post.author.username}
              className="w-8 h-8 rounded-full"
            />
            <span className="font-medium text-gray-900">
              {post.author.username}
            </span>
            <span className="text-sm text-gray-500">
              in {post.community.name}
            </span>
            <span className="text-sm text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt))}
            </span>
          </div>

          <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
          
          <div 
            className="prose prose-sm max-w-none mb-4"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {post.media && (
            <div className="mb-4">
              <img
                src={post.media.url}
                alt="Post media"
                className="rounded-lg max-w-full h-auto"
              />
            </div>
          )}

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 hover:text-blue-600"
            >
              <MessageSquare size={16} />
              <span>{post.commentCount} comments</span>
            </button>
            
            <button className="flex items-center space-x-1 hover:text-green-600">
              <Share2 size={16} />
              <span>Share</span>
            </button>
            
            <button className="flex items-center space-x-1 hover:text-red-600">
              <Bookmark size={16} />
              <span>Save</span>
            </button>
          </div>

          {showComments && (
            <CommentSection 
              postId={post._id} 
              comments={post.comments} 
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;