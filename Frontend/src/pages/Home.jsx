// src/pages/Home.js
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useNavigate } from "react-router-dom";

import { 
  Sparkles, 
  ArrowRight, 
  Play,
  X,
  Users,
  Star,
  MessageSquare,
  Shield,
  Globe,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Zap,
  Code,
  Palette,
  Camera,
  Music,
  BookOpen,
  ThumbsUp,
  Rocket,
  Heart,
  Share,
  Bookmark,
  TrendingUp,
  Award,
  Clock,
  CheckCircle
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

   const navigate = useNavigate();

  // Mock testimonials
  const mockTestimonials = [
    {
      id: 1,
      name: "Alex Johnson",
      role: "Community Lead",
      avatar: "AJ",
      content: "NicheConnect has transformed how we manage our community. Engagement is up 300% since we moved here!",
      rating: 5,
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      name: "Maria Rodriguez",
      role: "UX Designer",
      avatar: "MR",
      content: "As a designer, I appreciate the clean interface and thoughtful user experience. It's a joy to use daily.",
      rating: 5,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 3,
      name: "James Wilson",
      role: "Software Engineer",
      avatar: "JW",
      content: "The API integrations and customization options have allowed us to build exactly what our community needs.",
      rating: 4,
      color: "from-orange-500 to-red-500"
    }
  ];

  const auth = useAuth() 
  console.log("i am auth", auth)
  // Features with icons and animations
  const mockFeatures = [
    {
      title: "Real-time Communication",
      description: "Instant messaging, voice channels, and live streaming for seamless interaction",
      icon: MessageSquare,
      color: "from-blue-500 to-cyan-500",
      animation: {
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0]
      }
    },
    {
      title: "Advanced Moderation",
      description: "AI-powered tools to keep your community safe and welcoming",
      icon: Shield,
      color: "from-purple-500 to-pink-500",
      animation: {
        y: [0, -10, 0],
        scale: [1, 1.05, 1]
      }
    },
    {
      title: "Global Reach",
      description: "Connect with members from around the world with multi-language support",
      icon: Globe,
      color: "from-orange-500 to-red-500",
      animation: {
        rotate: [0, 360],
        scale: [1, 1.1, 1]
      }
    },
    {
      title: "Analytics Dashboard",
      description: "Track growth, engagement, and member activity with detailed insights",
      icon: BarChart3,
      color: "from-green-500 to-teal-500",
      animation: {
        y: [0, -5, 0],
        scale: [1, 1.05, 1]
      }
    }
  ];

  // Community categories
  const communityCategories = [
    { name: "Technology", icon: Code, count: "2.4K", color: "from-blue-400 to-cyan-400" },
    { name: "Design", icon: Palette, count: "1.8K", color: "from-purple-400 to-pink-400" },
    { name: "Photography", icon: Camera, count: "1.2K", color: "from-orange-400 to-red-400" },
    { name: "Music", icon: Music, count: "980", color: "from-green-400 to-teal-400" },
    { name: "Education", icon: BookOpen, count: "1.5K", color: "from-indigo-400 to-blue-400" },
    { name: "Gaming", icon: Zap, count: "3.1K", color: "from-yellow-400 to-orange-400" }
  ];

  // Benefits list
  const benefits = [
    { icon: Clock, text: "Quick setup in minutes" },
    { icon: Users, text: "Scale to millions of members" },
    { icon: Shield, text: "Enterprise-grade security" },
    { icon: TrendingUp, text: "Built-in growth tools" },
    { icon: Award, text: "Member recognition system" },
    { icon: CheckCircle, text: "99.9% uptime guarantee" }
  ];

  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % mockTestimonials.length);
    }, 5000);

    const featureInterval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % mockFeatures.length);
    }, 4000);

    return () => {
      clearInterval(testimonialInterval);
      clearInterval(featureInterval);
    };
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % mockTestimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + mockTestimonials.length) % mockTestimonials.length);
  };

  // Testimonial Card Component
  const TestimonialCard = ({ testimonial }) => {
    return (
      <motion.div
        key={testimonial.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-8 text-center"
      >
        <motion.div
          className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r ${testimonial.color} rounded-full flex items-center justify-center text-white text-xl font-bold`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {testimonial.avatar}
        </motion.div>
        
        <div className="flex justify-center mb-4">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Star
                size={20}
                className={i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
              />
            </motion.div>
          ))}
        </div>
        
        <motion.p 
          className="text-gray-700 text-lg mb-6 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          "{testimonial.content}"
        </motion.p>
        
        <div>
          <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
          <p className="text-gray-600">{testimonial.role}</p>
        </div>
      </motion.div>
    );
  };

  // Feature Card Component
  const FeatureCard = ({ feature, index }) => {
    const Icon = feature.icon;
    const cardRef = useRef(null);
    const isCardInView = useInView(cardRef, { once: true, margin: "-50px" });
    
    return (
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={isCardInView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        whileHover={{ 
          y: -10,
          scale: 1.02,
          transition: { type: "spring", stiffness: 300 }
        }}
        className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
      >
        <motion.div
          className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4`}
          animate={feature.animation}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Icon size={24} />
        </motion.div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
        <p className="text-gray-600">{feature.description}</p>
      </motion.div>
    );
  };

  // Floating particles component
  const FloatingParticles = ({ count = 20 }) => {
    return (
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(count)].map((_, i) => (
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
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white min-h-screen flex items-center">
        <FloatingParticles count={30} />
        
        {/* Animated background elements */}
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
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 mx-auto"
            >
              <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
              <span>Join 50,000+ community builders</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6"
            >
              Build Your
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Niche Community
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
            >
              Create engaging spaces, foster meaningful connections, and grow together with people who share your passions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold shadow-lg transition-all duration-300 flex items-center justify-center group"
               
               onClick={() => {
             if (!auth.currentUser) {
                navigate("/register");  
               } else {
               navigate("/feed");  
              }
         }}
             
               >
                Start Your Community
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.span>
              </motion.button>

              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 255, 0.2)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsVideoPlaying(true)}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold border border-white/20 transition-all duration-300 flex items-center justify-center group"
              >
                <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="text-white/60 cursor-pointer"
            onClick={() => {
              document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <motion.div
              whileHover={{ scale: 1.2 }}
              className="w-8 h-8 border-2 border-white/60 rounded-full flex items-center justify-center mx-auto mb-2"
            >
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-3 bg-white/60 rounded-full"
              />
            </motion.div>
            <p className="text-sm">Scroll to explore</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white" ref={sectionRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { number: "50K+", label: "Active Communities", delay: 0.1, icon: Users },
              { number: "2M+", label: "Members", delay: 0.2, icon: Heart },
              { number: "99%", label: "Satisfaction", delay: 0.3, icon: Star },
              { number: "24/7", label: "Support", delay: 0.4, icon: Shield }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: stat.delay }}
                  whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-lg text-gray-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 mb-4"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Powerful Features
            </motion.div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything Your Community Needs</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Designed to help you create, grow, and manage your perfect community space
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {mockFeatures.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-center lg:text-left"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose NicheConnect?</h2>
              <p className="text-xl text-gray-600 mb-8">
                We've built the platform that community leaders love, with everything you need to succeed.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors duration-300"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-800">{benefit.text}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="relative bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl p-8 text-white text-center shadow-2xl"
              >
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-400/20 rounded-full blur-xl"></div>
                
                <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                <p className="mb-6 opacity-90">Join thousands of community builders today</p>
                
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(255, 255, 255, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold w-full"
                >
                  Create Your Community
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Community Categories */}
      <section className="py-20 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore Diverse Communities</h2>
            <p className="text-xl text-gray-600">
              Find your people in thousands of communities across every interest and passion
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {communityCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  onHoverStart={() => setHoveredCategory(index)}
                  onHoverEnd={() => setHoveredCategory(null)}
                  className="bg-white rounded-xl p-4 text-center shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-200"
                >
                  <motion.div
                    animate={{ 
                      scale: hoveredCategory === index ? 1.15 : 1,
                      rotate: hoveredCategory === index ? 5 : 0
                    }}
                    className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center text-white`}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>
                  <h3 className="font-semibold text-gray-800 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count} communities</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Community Builders</h2>
            <p className="text-xl text-gray-600">
              Join thousands of community leaders who are creating amazing spaces with NicheConnect
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {mockTestimonials.map((testimonial, index) => (
                index === currentTestimonial && (
                  <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                )
              ))}
            </AnimatePresence>

            <div className="flex justify-center mt-8 space-x-4">
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
                whileTap={{ scale: 0.9 }}
                onClick={prevTestimonial}
                className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
                whileTap={{ scale: 0.9 }}
                onClick={nextTestimonial}
                className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="flex justify-center space-x-2 mt-6">
              {mockTestimonials.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-blue-500 w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-6"
          >
            Ready to Build Your Community?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl mb-8 opacity-90"
          >
            Join thousands of community builders who are already using NicheConnect to create engaging spaces.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(255, 255, 255, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold shadow-lg transition-all duration-300"
            >
              Get Started Free
            </motion.button>
            <motion.button
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.2)"
              }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-transparent text-white rounded-lg font-semibold border border-white/20 transition-all duration-300"
            >
              Schedule a Demo
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsVideoPlaying(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-black rounded-2xl overflow-hidden w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                onClick={() => setIsVideoPlaying(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:text-gray-300 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </motion.button>
              <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Play className="w-16 h-16 mx-auto mb-4 opacity-80" />
                  </motion.div>
                  <p className="text-xl font-semibold">Community Platform Demo</p>
                  <p className="text-gray-300 mt-2">See how NicheConnect can transform your community</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;