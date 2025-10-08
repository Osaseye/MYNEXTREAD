import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Sparkles, Heart, User, LogIn, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logoImage from '../assets/mynextread-logo.png';

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();

  // Hide sidebar on Landing page, ItemDetail pages, Login, Register, and ForgotPassword pages
  const hideSidebar = location.pathname === '/' || 
                     location.pathname.includes('/explore/') || 
                     location.pathname === '/login' || 
                     location.pathname === '/register' || 
                     location.pathname === '/forgot-password';

  // Navigation items - only show to authenticated users
  const navItems = currentUser ? [
    { path: '/explore', label: 'Explore', icon: Search },
    { path: '/recommendations', label: 'Recommend', icon: Sparkles },
    { path: '/saved', label: 'Saved', icon: Heart },
  ] : [];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Don't render sidebar on Landing page and ItemDetail pages
  if (hideSidebar) {
    return null;
  }

  return (
    <>
      {/* Hamburger Menu Button - Desktop */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="hidden md:block fixed top-4 left-4 z-50 p-3 hover:bg-gray-800/30 transition-colors rounded-lg"
      >
        {isSidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
      </button>

      {/* Sidebar - Only show when open */}
      {isSidebarOpen && (
        <div className="hidden md:block fixed top-0 left-0 h-full w-80 bg-black backdrop-blur-lg border-r border-gray-800 z-40 transition-all duration-300">
          <div className="p-6 h-full overflow-y-auto">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex flex-col items-center justify-center mb-8 p-4 rounded-xl hover:bg-gray-800/50 transition-all duration-300"
              onClick={() => setIsSidebarOpen(false)}
            >
              <img 
                src={logoImage} 
                alt="MyNextRead Logo" 
                className="w-16 h-16 mb-3 rounded-xl"
              />
              <div className="text-center">
                <h2 className="text-xl font-bold text-white">
                  MyNextRead
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Discover Your Next Story
                </p>
              </div>
            </Link>
          
            {/* Navigation Items */}
            <nav className="space-y-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    location.pathname === path
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold'
                      : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
            </nav>

            {/* Divider */}
            <div className="my-6 border-t border-gray-700"></div>

            {/* Authentication Section */}
            <div className="space-y-2">
              {currentUser ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsSidebarOpen(false)}
                    className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      location.pathname === '/profile'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold'
                        : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Profile</span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-gray-800/50 text-gray-300 hover:text-white w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    location.pathname === '/login'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold'
                      : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                  }`}
                >
                  <LogIn className="w-5 h-5" />
                  <span className="font-medium">Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overlay for mobile (if needed) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;