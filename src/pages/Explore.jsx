import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, TrendingUp, Filter, Tv, BookOpen, FileText, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AniListService from '../services/anilist';
import MediaCard from '../components/MediaCard';
import { useDebounce, LoadingState } from '../utils/hooks';
import { PageTransition } from '../utils/animations.jsx';

const Explore = () => {
  const { currentUser } = useAuth();
  const [activeCategory, setActiveCategory] = useState('ANIME');
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingItems, setTrendingItems] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(LoadingState.IDLE);
  const [searchLoading, setSearchLoading] = useState(LoadingState.IDLE);
  const [error, setError] = useState(null);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Close category menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCategoryMenu && !event.target.closest('.category-menu-container')) {
        setShowCategoryMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showCategoryMenu]);

  // Category configuration with proper icons
  const categories = [
    { id: 'ANIME', label: 'Anime', icon: Tv, color: 'anime-cyan' },
    { id: 'MANGA', label: 'Manga', icon: BookOpen, color: 'anime-pink' }
  ];

  // Fetch trending items when category changes
  useEffect(() => {
    const fetchTrending = async () => {
      setTrendingLoading(LoadingState.LOADING);
      setError(null);
      
      try {
        const response = await AniListService.getTrending(activeCategory, 1, 24);
        const formattedItems = response.media.map(AniListService.formatMediaItem);
        setTrendingItems(formattedItems);
        setTrendingLoading(LoadingState.SUCCESS);
      } catch (err) {
        console.error('Error fetching trending:', err);
        setError('Failed to load trending items');
        setTrendingLoading(LoadingState.ERROR);
      }
    };

    fetchTrending();
  }, [activeCategory]);

  // Search functionality
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(LoadingState.IDLE);
      return;
    }

    const performSearch = async () => {
      setSearchLoading(LoadingState.LOADING);
      setError(null);

      try {
        const response = await AniListService.search(debouncedSearchQuery, activeCategory, 1, 30);
        const formattedResults = response.media.map(AniListService.formatMediaItem);
        setSearchResults(formattedResults);
        setSearchLoading(LoadingState.SUCCESS);
      } catch (err) {
        console.error('Error searching:', err);
        setError('Failed to search items');
        setSearchLoading(LoadingState.ERROR);
      }
    };

    performSearch();
  }, [debouncedSearchQuery, activeCategory]);



  const renderMediaGrid = (items, loading) => {
    if (loading === LoadingState.LOADING) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-anime-card/50 rounded-xl shadow-anime-card overflow-hidden animate-anime-pulse">
              <div className="aspect-[3/4] bg-anime-hover/30 animate-pulse"></div>
              <div className="p-3 space-y-2">
                <div className="h-4 bg-anime-hover/30 rounded animate-pulse"></div>
                <div className="h-3 bg-anime-hover/20 rounded animate-pulse w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (loading === LoadingState.ERROR) {
      return (
        <div className="text-center py-12">
          <div className="bg-anime-card/50 backdrop-blur-sm border border-anime-pink/30 rounded-2xl p-8 max-w-md mx-auto">
            <div className="text-anime-pink text-4xl mb-4">⚠️</div>
            <p className="text-anime-text-primary mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-r from-anime-pink to-anime-purple px-6 py-3 rounded-lg text-anime-dark font-semibold hover:shadow-anime-glow-pink transition-all duration-300 anime-hover-lift"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (items.length === 0 && loading === LoadingState.SUCCESS) {
      return (
        <div className="text-center py-12">
          <div className="bg-anime-card/30 backdrop-blur-sm border border-anime-purple/20 rounded-2xl p-8 max-w-md mx-auto">
            <div className="text-anime-text-muted text-4xl mb-4">🔍</div>
            <p className="text-anime-text-secondary">No items found</p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {items.map((item) => (
          <MediaCard 
            key={item.id} 
            media={item}
          />
        ))}
      </div>
    );
  };

  // Authentication guard
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Please Sign In</h2>
          <p className="text-gray-400 mb-6">You need to be logged in to explore content</p>
          <Link
            to="/login"
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
          >
            <User className="w-5 h-5" />
            <span>Go to Login</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="min-h-screen">
      {/* Mobile/Desktop Responsive Controls */}
      <div className="fixed top-4 right-4 z-40">
        {/* Desktop: Search + Floating Category Button */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-anime-text-muted">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder={`Search ${
                activeCategory === 'ANIME' ? 'anime' : 
                activeCategory === 'MANGA' ? 'manga' : 
                'light novels'
              }...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 bg-anime-card/90 backdrop-blur-sm border border-anime-hover rounded-xl text-anime-text-primary placeholder-anime-text-muted focus:border-anime-cyan focus:shadow-anime-glow-cyan/50 outline-none transition-all duration-300 text-sm"
            />
          </div>

          {/* Floating Category Selector */}
          <div className="relative category-menu-container">
            <button
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className="w-12 h-12 bg-gradient-to-r from-anime-cyan to-anime-purple rounded-full flex items-center justify-center text-black shadow-anime-glow-cyan hover:shadow-anime-glow-purple transition-all duration-300 transform hover:scale-105"
            >
              {(() => {
                const activeIcon = categories.find(cat => cat.id === activeCategory)?.icon;
                const IconComponent = activeIcon;
                return <IconComponent className="w-5 h-5" />;
              })()}
            </button>

            {/* Category Menu */}
            {showCategoryMenu && (
              <div className="absolute top-full right-0 mt-2 bg-anime-card/95 backdrop-blur-sm border border-anime-hover rounded-xl p-2 z-50 min-w-[120px]">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveCategory(category.id);
                        setShowCategoryMenu(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-all duration-300 text-left ${
                        activeCategory === category.id
                          ? 'bg-gradient-to-r from-anime-cyan to-anime-purple text-black shadow-anime-glow-cyan'
                          : 'text-anime-text-secondary hover:text-anime-text-primary hover:bg-anime-hover/30'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm">{category.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Search + Floating Category Button */}
        <div className="md:hidden flex items-center space-x-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-anime-text-muted">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-anime-card/90 backdrop-blur-sm border border-anime-hover rounded-xl text-anime-text-primary placeholder-anime-text-muted focus:border-anime-cyan focus:shadow-anime-glow-cyan/50 outline-none transition-all duration-300 text-sm"
            />
          </div>

          {/* Floating Category Selector */}
          <div className="relative category-menu-container">
            <button
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className="w-10 h-10 bg-gradient-to-r from-anime-cyan to-anime-purple rounded-full flex items-center justify-center text-black shadow-anime-glow-cyan hover:shadow-anime-glow-purple transition-all duration-300 transform hover:scale-105"
            >
              {(() => {
                const activeIcon = categories.find(cat => cat.id === activeCategory)?.icon;
                const IconComponent = activeIcon;
                return <IconComponent className="w-4 h-4" />;
              })()}
            </button>

            {/* Category Menu */}
            {showCategoryMenu && (
              <div className="absolute top-full right-0 mt-2 bg-anime-card/95 backdrop-blur-sm border border-anime-hover rounded-xl p-2 z-50 min-w-[120px]">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveCategory(category.id);
                        setShowCategoryMenu(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-all duration-300 text-left ${
                        activeCategory === category.id
                          ? 'bg-gradient-to-r from-anime-cyan to-anime-purple text-black shadow-anime-glow-cyan'
                          : 'text-anime-text-secondary hover:text-anime-text-primary hover:bg-anime-hover/30'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm">{category.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        {/* Search Results */}
        {searchQuery.trim() && (
          <section className="mb-12 lg:mb-16">
            <div className="flex items-center space-x-3 mb-6 lg:mb-8">
              <Search className="w-6 h-6 text-anime-cyan" />
              <h2 className="text-2xl lg:text-3xl font-bold text-anime-text-primary">
                Search Results for <span className="text-anime-cyan">"{searchQuery}"</span>
              </h2>
              {searchLoading === LoadingState.LOADING && (
                <Loader2 className="w-6 h-6 animate-spin text-anime-cyan" />
              )}
            </div>
            {renderMediaGrid(searchResults, searchLoading)}
          </section>
        )}

        {/* Trending Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-anime-pink animate-anime-pulse" />
              <h2 className="text-2xl lg:text-3xl font-bold text-anime-text-primary">
                Trending <span className="text-anime-cyan">
                  {activeCategory === 'ANIME' ? 'Anime' : activeCategory === 'MANGA' ? 'Manga' : 'Light Novels'}
                </span>
              </h2>
              {trendingLoading === LoadingState.LOADING && (
                <Loader2 className="w-6 h-6 animate-spin text-anime-pink" />
              )}
            </div>
          </div>
          {renderMediaGrid(trendingItems, trendingLoading)}
        </section>
      </div>
    </PageTransition>
  );
};

export default Explore;