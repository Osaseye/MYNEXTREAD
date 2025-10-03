import React, { useState, useEffect } from 'react';
import { Search, Heart, Trash2, BookmarkX, Filter, Tv, BookOpen, FileText, X, Sparkles, TrendingUp } from 'lucide-react';
import MediaCard from '../components/MediaCard';
import { SavedItemsManager } from '../utils/savedItems';
import { useDebounce } from '../utils/hooks';

const Saved = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [savedItems, setSavedItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // recent, title, rating
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Category configuration with proper icons
  const categories = [
    { id: 'all', label: 'All', icon: Sparkles, color: 'anime-cyan' },
    { id: 'anime', label: 'Anime', icon: Tv, color: 'anime-cyan' },
    { id: 'manga', label: 'Manga', icon: BookOpen, color: 'anime-purple' },
    { id: 'novel', label: 'Light Novels', icon: FileText, color: 'anime-pink' },
  ];

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

  // Load saved items on component mount
  useEffect(() => {
    const loadSavedItems = () => {
      const items = SavedItemsManager.getSavedItems();
      setSavedItems(items);
    };

    loadSavedItems();
    
    // Listen for storage changes in case items are saved from other tabs
    const handleStorageChange = () => {
      loadSavedItems();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filter items based on active tab and search query
  useEffect(() => {
    let filtered = savedItems;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(item => item.type === activeCategory);
    }

    // Filter by search query
    if (debouncedSearchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.genres.some(genre => 
          genre.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        )
      );
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'rating':
          return (b.score || 0) - (a.score || 0);
        case 'recent':
        default:
          return new Date(b.savedAt) - new Date(a.savedAt);
      }
    });

    setFilteredItems(filtered);
  }, [savedItems, activeCategory, debouncedSearchQuery, sortBy]);

  const handleRemoveItem = (itemId) => {
    const success = SavedItemsManager.removeItem(itemId);
    if (success) {
      setSavedItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all saved items? This action cannot be undone.')) {
      const success = SavedItemsManager.clearAll();
      if (success) {
        setSavedItems([]);
      }
    }
  };

  const getTabCount = (type) => {
    if (type === 'all') return savedItems.length;
    return savedItems.filter(item => item.type === type).length;
  };



  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Heart className="w-8 h-8 text-anime-pink fill-current" />
              <h1 className="text-3xl font-bold text-white">My Library</h1>
            </div>
            
            {savedItems.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center space-x-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* Floating Category Button */}
          <div className="relative category-menu-container mb-6">
            <button
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className="flex items-center space-x-3 bg-black/90 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-lg hover:bg-black/80 transition-all duration-300 border border-white/10"
            >
              {(() => {
                const currentCategory = categories.find(cat => cat.id === activeCategory);
                const IconComponent = currentCategory.icon;
                return (
                  <>
                    <IconComponent className={`w-5 h-5 text-${currentCategory.color}`} />
                    <span className="font-medium">{currentCategory.label}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/20 text-white">
                      {getTabCount(activeCategory)}
                    </span>
                    <X className={`w-4 h-4 ml-2 transition-transform duration-300 ${showCategoryMenu ? 'rotate-45' : 'rotate-0'}`} />
                  </>
                );
              })()}
            </button>

            {/* Dropdown Menu */}
            {showCategoryMenu && (
              <div className="absolute top-full left-0 mt-2 bg-black/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10 py-2 min-w-[200px] z-50">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const count = getTabCount(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveCategory(category.id);
                        setShowCategoryMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors ${
                        activeCategory === category.id ? 'bg-white/10' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className={`w-5 h-5 text-${category.color}`} />
                        <span className="text-white font-medium">{category.label}</span>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/20 text-white">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search and Sort Controls */}
          {savedItems.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search your saved items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-anime-cyan focus:border-anime-cyan outline-none text-white placeholder-gray-400"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-anime-cyan focus:border-anime-cyan outline-none text-white"
                >
                  <option value="recent">Recently Added</option>
                  <option value="title">Title A-Z</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {savedItems.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <BookmarkX className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Saved Items Yet</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Start building your personal library by saving anime, manga, and light novels you want to read or watch later.
            </p>
            <a
              href="/explore"
              className="inline-block bg-anime-gold text-black px-6 py-3 rounded-lg font-semibold hover:bg-anime-gold/80 transition-colors"
            >
              Explore Content
            </a>
          </div>
        ) : filteredItems.length === 0 ? (
          // No Results State
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Results Found</h2>
            <p className="text-gray-400 mb-6">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="bg-anime-cyan text-black px-6 py-3 rounded-lg font-semibold hover:bg-anime-cyan/80 transition-colors"
            >
              Show All Items
            </button>
          </div>
        ) : (
          // Items Grid
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400">
                Showing {filteredItems.length} of {savedItems.length} saved items
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="relative group">
                  <MediaCard media={item} />
                  
                  {/* Remove Button Overlay */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveItem(item.id);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                    title="Remove from library"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;