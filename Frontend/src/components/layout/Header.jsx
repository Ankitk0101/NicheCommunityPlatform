import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  ArrowRight,
  Star,
  ChevronDown,
  Sparkles
} from 'lucide-react';

const Header = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const headerRef = useRef(null);
  
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);
  const y = useTransform(scrollY, [0, 300], [0, 100]);

  const features = [
    {
      title: "Join Vibrant Communities",
      description: "Discover and connect with like-minded people in specialized communities",
      icon: Users,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Engage in Meaningful Discussions",
      description: "Participate in threaded conversations with rich media support",
      icon: MessageSquare,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Grow Your Influence",
      description: "Build reputation and become a trusted voice in your niche",
      icon: TrendingUp,
      color: "from-orange-500 to-red-500"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight - 80,
      behavior: 'smooth'
    });
  };

  return (
    <motion.header
      ref={headerRef}
      style={{ opacity, scale, y }}
      className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}

        {/* Gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
            >
              <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="text-sm text-white/90">Join 50,000+ community builders</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
            >
              Build Your
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Niche Community
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl text-gray-300 mb-8 max-w-2xl"
            >
              Create engaging spaces, foster meaningful connections, and grow together with people who share your passions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center"
              >
                Start Your Community
                <ArrowRight className="ml-2 w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsVideoPlaying(true)}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/10"
            >
              {[
                { number: "50K+", label: "Active Communities" },
                { number: "2M+", label: "Members" },
                { number: "99%", label: "Satisfaction Rate" }
              ].map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-white">{stat.number}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right side - Feature showcase */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
              {/* Feature content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <motion.div
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${features[currentFeature].color} mb-6`}
                    animate={{
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                    }}
                  >
                    {/* <features[currentFeature].icon className="w-8 h-8 text-white"/> */}
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {features[currentFeature].title}
                  </h3>
                  
                  <p className="text-gray-300 mb-6">
                    {features[currentFeature].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Feature indicators */}
              <div className="flex justify-center space-x-2 mt-6">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeature(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentFeature 
                        ? 'bg-blue-500 w-8' 
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Floating community cards */}
            <motion.div
              className="absolute -top-4 -left-4 w-24 h-32 bg-white rounded-lg shadow-lg p-3"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            >
              <div className="w-full h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-md mb-2"></div>
              <div className="text-xs font-semibold text-gray-800">Tech Talks</div>
              <div className="text-xs text-gray-500">1.2k members</div>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -right-4 w-24 h-32 bg-white rounded-lg shadow-lg p-3"
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: 1,
              }}
            >
              <div className="w-full h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-md mb-2"></div>
              <div className="text-xs font-semibold text-gray-800">Design Hub</div>
              <div className="text-xs text-gray-500">890 members</div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.button
          onClick={scrollToContent}
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="text-white/60 hover:text-white transition-colors duration-300"
        >
          <ChevronDown className="w-8 h-8" />
        </motion.button>
      </motion.div>

      {/* Video modal */}
      <AnimatePresence>
        {isVideoPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setIsVideoPlaying(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-black rounded-lg overflow-hidden w-full max-w-4xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsVideoPlaying(false)}
                className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="aspect-video bg-gray-800 flex items-center justify-center">
                <div className="text-white text-center">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Community Platform Demo</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;