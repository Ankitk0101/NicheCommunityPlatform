import { useState } from 'react';
import { motion } from 'framer-motion';

const InterestSelector = ({ onComplete }) => {
  const [selectedInterests, setSelectedInterests] = useState([]);

  const interests = [
    { id: 'technology', name: 'Technology', emoji: '💻' },
    { id: 'gaming', name: 'Gaming', emoji: '🎮' },
    { id: 'art', name: 'Art', emoji: '🎨' },
    { id: 'music', name: 'Music', emoji: '🎵' },
    { id: 'science', name: 'Science', emoji: '🔬' },
    { id: 'sports', name: 'Sports', emoji: '⚽' },
    { id: 'travel', name: 'Travel', emoji: '✈️' },
    { id: 'food', name: 'Food', emoji: '🍔' },
    { id: 'fitness', name: 'Fitness', emoji: '💪' },
    { id: 'books', name: 'Books', emoji: '📚' },
    { id: 'photography', name: 'Photography', emoji: '📷' },
    { id: 'movies', name: 'Movies', emoji: '🎥' }
  ];

  const toggleInterest = (interestId) => {
    if (selectedInterests.includes(interestId)) {
      setSelectedInterests(selectedInterests.filter(id => id !== interestId));
    } else {
      setSelectedInterests([...selectedInterests, interestId]);
    }
  };

  const handleSubmit = () => {
    // Save selected interests and complete onboarding
    onComplete(selectedInterests);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">What are you interested in?</h1>
          <p className="text-gray-600">Select your interests to help us recommend relevant communities</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {interests.map(interest => (
            <motion.button
              key={interest.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleInterest(interest.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center ${
                selectedInterests.includes(interest.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl mb-2">{interest.emoji}</span>
              <span className="text-sm font-medium text-gray-700">{interest.name}</span>
            </motion.button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={selectedInterests.length === 0}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Communities
          </button>
          
          {selectedInterests.length === 0 && (
            <p className="text-sm text-gray-500 mt-3">Select at least one interest to continue</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default InterestSelector;