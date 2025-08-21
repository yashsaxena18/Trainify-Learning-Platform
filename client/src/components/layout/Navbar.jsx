// src/components/layout/Navbar.jsx - Modern Animated Navbar (Fixed Overlap Issue)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, BookOpen, Settings, Home, Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add minimal padding to body to prevent content overlap
  useEffect(() => {
    // Add padding-top to body to account for fixed navbar - minimal spacing
    document.body.style.paddingTop = '64px'; // Exact navbar height
    
    return () => {
      // Cleanup when component unmounts
      document.body.style.paddingTop = '0px';
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserDropdown(false);
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'admin': return '/admin/dashboard';
      case 'instructor': return '/instructor/dashboard';
      case 'student': return '/student/dashboard';
      default: return '/';
    }
  };

  // Check if current route is home page
  const isHomePage = location.pathname === '/';

  return (
    <>
      <motion.nav 
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/90 backdrop-blur-xl shadow-2xl border-b border-white/20' 
            : 'bg-white/95 backdrop-blur-lg shadow-lg'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Gradient Border */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
        
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            {/* Logo Section */}
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Link to="/" className="flex items-center group">
                <motion.div
                  className="relative"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <BookOpen className="h-8 w-8 text-transparent bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 opacity-20 rounded-full blur-lg"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                <motion.span 
                  className="ml-3 text-2xl font-black bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-900 bg-clip-text text-transparent"
                  whileHover={{ 
                    background: "linear-gradient(to right, #06b6d4, #8b5cf6, #ec4899)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}
                >
                  Trainify
                </motion.span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Navigation Links */}
              <div className="flex items-center space-x-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                      isHomePage
                        ? 'text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25'
                        : 'text-gray-700 hover:text-cyan-600 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50'
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </motion.div>

                {isAuthenticated && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to={getDashboardLink()}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                        !isHomePage
                          ? 'text-white bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25'
                          : 'text-gray-700 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
                      }`}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </motion.div>
                )}

                {/* Auth Links for non-authenticated users */}
                {!isAuthenticated && (
                  <div className="flex items-center space-x-3">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/login"
                        className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"
                      >
                        Sign In
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/register"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 shadow-lg shadow-indigo-500/25"
                      >
                        Get Started
                      </Link>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* User Section - Only show if authenticated */}
              {isAuthenticated && (
                <div className="relative flex items-center space-x-4 border-l border-gray-200 pl-6">
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.02 }}
                  >
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center space-x-3 p-2 rounded-2xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 transition-all duration-300 group"
                    >
                      <div className="relative">
                        <motion.div 
                          className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <span className="text-white text-sm font-bold">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </motion.div>
                        <motion.div
                          className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                      
                      <div className="hidden lg:block text-left">
                        <div className="text-sm font-bold text-gray-900">{user?.name}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full font-bold capitalize">
                            {user?.role}
                          </span>
                        </div>
                      </div>
                      
                      <motion.div
                        animate={{ rotate: showUserDropdown ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-indigo-600" />
                      </motion.div>
                    </button>

                    {/* User Dropdown */}
                    <AnimatePresence>
                      {showUserDropdown && (
                        <motion.div
                          className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold">
                                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div>
                                <div className="font-bold text-white">{user?.name}</div>
                                <div className="text-white/80 text-sm">{user?.email}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-2">
                            <motion.button
                              onClick={handleLogout}
                              className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-xl transition-all duration-300 group"
                              whileHover={{ x: 5 }}
                            >
                              <LogOut className="h-4 w-4 text-red-500 group-hover:text-red-600" />
                              <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">
                                Sign Out
                              </span>
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-indigo-600 p-2 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                className="md:hidden border-t border-gray-200/50 backdrop-blur-xl"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="py-4 px-2 bg-gradient-to-b from-white/90 to-gray-50/90">
                  <div className="flex flex-col space-y-2">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Link
                        to="/"
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                          isHomePage 
                            ? 'text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg' 
                            : 'text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50'
                        }`}
                      >
                        <Home className="h-5 w-5" />
                        <span>Home</span>
                      </Link>
                    </motion.div>

                    {isAuthenticated ? (
                      <>
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Link
                            to={getDashboardLink()}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                              !isHomePage 
                                ? 'text-white bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg' 
                                : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
                            }`}
                          >
                            <Settings className="h-5 w-5" />
                            <span>Dashboard</span>
                          </Link>
                        </motion.div>

                        {/* User Info in Mobile */}
                        <motion.div 
                          className="mt-4 pt-4 border-t border-gray-200"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div>
                                <div className="font-bold text-white">{user?.name}</div>
                                <div className="text-white/80 text-sm">{user?.email}</div>
                                <div className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold capitalize mt-1 inline-block">
                                  {user?.role}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <motion.button
                            onClick={() => {
                              handleLogout();
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center space-x-3 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 w-full px-4 py-3 rounded-2xl transition-all duration-300"
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <LogOut className="h-5 w-5" />
                            <span className="font-bold">Sign Out</span>
                          </motion.button>
                        </motion.div>
                      </>
                    ) : (
                      <>
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Link
                            to="/login"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-2xl transition-all duration-300"
                          >
                            Sign In
                          </Link>
                        </motion.div>
                        
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Link
                            to="/register"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-4 py-3 text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white mx-2 rounded-2xl text-center hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                          >
                            Get Started
                          </Link>
                        </motion.div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Click outside to close dropdown */}
        {showUserDropdown && (
          <div 
            className="fixed inset-0 z-[-1]" 
            onClick={() => setShowUserDropdown(false)}
          />
        )}
      </motion.nav>

      {/* Minimal spacer to prevent overlap */}
      
    </>
  );
};

export default Navbar;