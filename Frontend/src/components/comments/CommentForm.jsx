import { useState } from 'react';
import { motion } from 'framer-motion';
import RichTextEditor from '../ui/RichTextEditor';

const CommentForm = ({ postId, parentId = null, onCancel, onSuccess, autoFocus = false }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please write a comment');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content,
          post: postId,
          parent: parentId
        })
      });

      if (response.ok) {
        setContent('');
        onSuccess();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to post comment');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      onSubmit={handleSubmit}
      className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200"
    >
      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="What are your thoughts?"
        autoFocus={autoFocus}
        disabled={isSubmitting}
        compact
      />
      
      {error && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 text-sm rounded">
          {error}
        </div>
      )}
      
      <div className="flex justify-end space-x-3 mt-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Posting...' : 'Comment'}
        </button>
      </div>
    </motion.form>
  );
};

export default CommentForm;