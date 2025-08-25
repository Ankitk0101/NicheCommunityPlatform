import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reply, ChevronDown, ChevronUp } from 'lucide-react';
import VotingWidget from '../ui/VotingWidget';
import CommentForm from './CommentForm';
import { formatDistanceToNow } from '../../utils/formatters';

const Comment = ({ comment, postId, level = 0 }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`${level > 0 ? 'ml-6' : ''}`}
    >
      <div className="bg-white rounded-lg p-4 mb-3 border border-gray-100">
        <div className="flex items-start space-x-3">
          <VotingWidget 
            commentId={comment._id} 
            votes={comment.votes} 
            userVote={comment.userVote} 
            size="sm"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span className="font-medium text-gray-900">{comment.author.name}</span>
              <span className="mx-2">•</span>
              <span>{formatDistanceToNow(comment.createdAt)}</span>
            </div>
            
            <div className="prose prose-sm max-w-none text-gray-700 mb-3">
              <div dangerouslySetInnerHTML={{ __html: comment.content }} />
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600"
              >
                <Reply size={14} />
                <span>Reply</span>
              </button>
              
              {comment.replyCount > 0 && (
                <button
                  onClick={toggleReplies}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600"
                >
                  {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  <span>{comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isReplying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <CommentForm
              postId={postId}
              parentId={comment._id}
              onCancel={() => setIsReplying(false)}
              onSuccess={() => setIsReplying(false)}
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>

      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map(reply => (
            <Comment
              key={reply._id}
              comment={reply}
              postId={postId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Comment;