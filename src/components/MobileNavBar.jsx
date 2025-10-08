import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Search, 
  Sparkles, 
  Heart, 
  User,
  LogIn
} from 'lucide-react';

const MobileNavBar = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // Don't show mobile nav on landing, auth pages, or when sidebar should be hidden
  const hiddenRoutes = ['/', '/login', '/register', '/forgot-password'];
  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  // Navigation items based on authentication status
  const navItems = currentUser ? [
    { path: '/explore', label: 'Explore', icon: Search },
    { path: '/recommendations', label: 'Recommend', icon: Sparkles },
    { path: '/saved', label: 'Saved', icon: Heart },
    { path: '/profile', label: 'Profile', icon: User },
  ] : [
    { path: '/login', label: 'Login', icon: LogIn },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors min-w-0 flex-1 ${
                isActive
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{label}</span>
            </Link>
          );
        })}
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-black"></div>
    </div>
  );
};

export default MobileNavBar;