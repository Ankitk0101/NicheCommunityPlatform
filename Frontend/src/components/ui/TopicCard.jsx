// src/components/ui/TopicCard.js
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const TopicCard = ({ topic, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="flex items-center">
        <TrendingUp className="w-4 h-4 text-blue-500 mr-2" />
        <span className="font-medium text-blue-600">{topic.tag}</span>
      </div>
      <span className="text-sm text-gray-500">{topic.posts}</span>
    </motion.div>
  );
};

export default TopicCard;