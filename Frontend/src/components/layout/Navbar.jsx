// src/components/layout/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Users, 
  Home as HomeIcon,
  User,
  LogOut,
  Settings,
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, loading } = useAuth(); // Changed from user to currentUser

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Navigation items - only show protected routes when user is logged in
  const navigationItems = [
    { id: 'home', label: 'Home', icon: HomeIcon, path: '/', public: true },
    { id: 'feed', label: 'Feed', icon: MessageSquare, path: '/feed', public: false },
    { id: 'communities', label: 'Communities', icon: Users, path: '/communities', public: false },
  ];

  const userMenuItems = [
    { label: 'Profile', icon: User, path: '/profile' },
    { label: 'Settings', icon: Settings, path: '/settings' },
    { label: 'Logout', icon: LogOut, action: handleLogout },
  ];

  // Filter navigation items based on authentication
  const filteredNavigationItems = navigationItems.filter(item => 
    currentUser ? true : item.public // Changed from user to currentUser
  );

  if (loading) {
    return (
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 h-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
          <div className="spinner-small"></div>
        </div>
      </motion.nav>
    );
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 flex items-center"
            >
              <Link to="/">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                  NicheConnect
                </motion.div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {filteredNavigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link
                      to={item.path}
                      className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                        isActive
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-blue-50 rounded-lg -z-10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* User Menu or Auth Buttons */}
              {currentUser ? ( // Changed from user to currentUser
                <motion.div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md group-hover:shadow-lg transition-shadow"
                    >
                      {currentUser.username?.charAt(0).toUpperCase() || 'U'} {/* Changed from user to currentUser */}
                    </motion.div>
                    <ChevronDown 
                      size={16} 
                      className={`text-gray-600 transition-transform duration-200 ${
                        isUserMenuOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {currentUser.username} {/* Changed from user to currentUser */}
                          </p>
                          <p className="text-xs text-gray-500">
                            {currentUser.email} {/* Changed from user to currentUser */}
                          </p>
                        </div>
                        
                        {userMenuItems.map((item, index) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ backgroundColor: "#f8fafc" }}
                            className="w-full px-4 py-2 text-left text-gray-700 hover:text-blue-600 flex items-center space-x-2 transition-colors duration-200 cursor-pointer"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              if (item.action) {
                                item.action();
                              } else if (item.path) {
                                navigate(item.path);
                              }
                            }}
                          >
                            <item.icon size={16} />
                            <span className="text-sm">{item.label}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div 
                  className="flex space-x-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 border border-blue-200"
                    >
                      Login
                    </motion.button>
                  </Link>
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Sign Up
                    </motion.button>
                  </Link>
                </motion.div>
              )}

              {/* Mobile menu button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white border-t border-gray-100"
            >
              <div className="px-4 py-4 space-y-2">
                {filteredNavigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                          isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </motion.div>
                    </Link>
                  );
                })}

                {/* Mobile Auth Buttons (only show when not logged in) */}
                {!currentUser && ( // Changed from user to currentUser
                  <div className="pt-4 border-t border-gray-100 space-y-2">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="w-full px-4 py-3 text-center text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                      >
                        Login
                      </motion.div>
                    </Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="w-full px-4 py-3 text-center text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                      >
                        Sign Up
                      </motion.div>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;