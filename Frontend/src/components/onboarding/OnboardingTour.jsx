import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const OnboardingTour = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to NicheConnect!",
      content: "Discover and join communities based on your interests. Let's take a quick tour to get you started.",
      image: "👋"
    },
    {
      title: "Explore Communities",
      content: "Browse through various communities or use the search to find ones that match your interests.",
      image: "🔍"
    },
    {
      title: "Join Discussions",
      content: "Participate in conversations, share your thoughts, and connect with like-minded people.",
      image: "💬"
    },
    {
      title: "Create Content",
      content: "Share posts, ask questions, and contribute to your communities with rich text formatting.",
      image: "📝"
    },
    {
      title: "Stay Updated",
      content: "Get real-time notifications and never miss important updates from your communities.",
      image: "🔔"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
        >
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            >
              <X size={24} />
            </button>

            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{steps[currentStep].image}</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {steps[currentStep].title}
                </h2>
                <p className="text-gray-600">
                  {steps[currentStep].content}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center space-x-1 text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                  <span>Back</span>
                </button>

                <div className="flex space-x-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextStep}
                  className="flex items-center space-x-1 text-blue-600"
                >
                  <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OnboardingTour;