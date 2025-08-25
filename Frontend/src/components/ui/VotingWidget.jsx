import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';

const VotingWidget = ({ postId, commentId, votes, userVote, size = 'md' }) => {
  const [currentVote, setCurrentVote] = useState(userVote || 0);
  const [currentVotes, setCurrentVotes] = useState(votes || 0);
  
  const isPost = !!postId;
  const entityId = postId || commentId;
  const iconSize = size === 'sm' ? 14 : 18;
  const containerSize = size === 'sm' ? 'w-6' : 'w-8';

  const handleVote = async (voteType) => {
    const newVote = currentVote === voteType ? 0 : voteType;
    const voteDiff = newVote - currentVote;
    
    // Optimistic update
    setCurrentVote(newVote);
    setCurrentVotes(currentVotes + voteDiff);
    
    try {
      const response = await fetch(`/api/${isPost ? 'posts' : 'comments'}/${entityId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ vote: newVote })
      });
      
      if (!response.ok) {
        // Revert if API call fails
        setCurrentVote(currentVote);
        setCurrentVotes(currentVotes);
      }
    } catch (error) {
      // Revert if network error
      setCurrentVote(currentVote);
      setCurrentVotes(currentVotes);
    }
  };

  return (
    <div className={`flex flex-col items-center ${containerSize}`}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleVote(1)}
        className={`p-1 rounded ${
          currentVote === 1 
            ? 'text-orange-500 bg-orange-50' 
            : 'text-gray-400 hover:text-orange-500 hover:bg-gray-100'
        }`}
      >
        <ArrowUp size={iconSize} />
      </motion.button>
      
      <span className={`font-medium my-1 ${
        currentVotes > 0 ? 'text-orange-500' : 
        currentVotes < 0 ? 'text-blue-500' : 
        'text-gray-500'
      } ${size === 'sm' ? 'text-sm' : ''}`}>
        {currentVotes}
      </span>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleVote(-1)}
        className={`p-1 rounded ${
          currentVote === -1 
            ? 'text-blue-500 bg-blue-50' 
            : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100'
        }`}
      >
        <ArrowDown size={iconSize} />
      </motion.button>
    </div>
  );
};

export default VotingWidget;