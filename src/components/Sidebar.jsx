import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Sparkles, Heart, Info, Menu, X } from 'lucide-react';
import logoImage from '../assets/mynextread-logo.png';

const Sidebar = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/explore', label: 'Explore', icon: Search },
    { path: '/recommendations', label: 'Recommend', icon: Sparkles },
    { path: '/saved', label: 'Saved', icon: Heart },
    { path: '/about', label: 'About', icon: Info },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Hamburger Menu Button - Fixed Position */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-3 text-anime-text-primary hover:text-anime-cyan transition-all duration-300"
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-anime-card border-r border-anime-hover transform transition-transform duration-300 z-40 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex flex-col items-center justify-center mb-8 p-4 rounded-xl hover:bg-anime-hover/30 transition-all duration-300"
            onClick={() => setIsSidebarOpen(false)}
          >
            <img 
              src={logoImage} 
              alt="MyNextRead Logo" 
              className="w-16 h-16 mb-3 rounded-xl shadow-anime-glow-cyan/50"
            />
            <div className="text-center">
              <h2 className="text-xl font-bold text-anime-text-primary">
                MyNextRead
              </h2>
              <p className="text-xs text-anime-text-muted mt-1">
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
                    ? 'bg-gradient-to-r from-anime-cyan to-anime-purple text-black font-semibold'
                    : 'hover:bg-anime-hover text-anime-text-secondary hover:text-anime-text-primary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;