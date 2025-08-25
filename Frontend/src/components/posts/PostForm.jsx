import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, Video, Link2 } from 'lucide-react';
import RichTextEditor from '../ui/RichTextEditor';

const PostForm = ({ communityId, onCancel, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title,
          content,
          community: communityId
        })
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create post');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-lg mb-6"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Create Post</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
                disabled={isSubmitting}
              />
            </div>

            <div className="mb-4">
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="What would you like to share?"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center space-x-3 mb-4">
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg"
                disabled={isSubmitting}
              >
                <Image size={20} />
              </button>
              
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg"
                disabled={isSubmitting}
              >
                <Video size={20} />
              </button>
              
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg"
                disabled={isSubmitting}
              >
                <Link2 size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PostForm;