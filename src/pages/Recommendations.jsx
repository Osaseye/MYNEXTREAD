import React, { useState } from 'react';
import { Heart, Filter, Shuffle, ArrowRight, Sparkles, RefreshCw, BookOpen, Star, Plus, X, AlertTriangle, Wifi, WifiOff, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SavedItemsManager } from '../utils/savedItems';
import AniListService from '../services/anilist';
import { LoadingState } from '../utils/hooks';
import { getBackupRecommendations, getRandomBackupRecommendation, getBackupRecommendationsFromSaved } from '../services/backupRecommendations';
import { PageTransition } from '../utils/animations.jsx';

const Recommendations = () => {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState('select'); // select, loading, result
  const [selectedMode, setSelectedMode] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    genres: [],
    minRating: 70,
    type: 'all'
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [usingBackup, setUsingBackup] = useState(false);

  const savedItems = SavedItemsManager.getSavedItems();

  const recommendationModes = [
    {
      id: 'likes',
      title: 'Based on Your Library',
      description: 'Get recommendations based on anime, manga, and light novels you\'ve saved',
      icon: Heart,
      gradient: 'from-anime-pink to-anime-purple',
      disabled: savedItems.length === 0,
      disabledMessage: 'Save some items first to get personalized recommendations'
    },
    {
      id: 'filters',
      title: 'Based on Filters',
      description: 'Choose specific genres, ratings, and preferences for targeted suggestions',
      icon: Filter,
      gradient: 'from-anime-cyan to-anime-blue',
      disabled: false
    },
    {
      id: 'surprise',
      title: 'Surprise Me',
      description: 'Get a completely random recommendation and discover something new',
      icon: Shuffle,
      gradient: 'from-anime-purple to-anime-pink',
      disabled: false
    }
  ];

  const allGenres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 
    'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller', 'Psychological',
    'Historical', 'School', 'Military', 'Music', 'Mecha', 'Magic'
  ];

  const generateRecommendation = async (mode) => {
    setError(null);
    setCurrentStep('loading');
    setUsingBackup(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Dramatic pause

      let recommendedItem = null;
      let reason = '';

      // Try API first, then fallback to backup
      try {
        switch (mode) {
          case 'likes':
            ({ recommendedItem, reason } = await getRecommendationBasedOnLikes());
            break;
          case 'filters':
            ({ recommendedItem, reason } = await getRecommendationBasedOnFilters());
            break;
          case 'surprise':
            ({ recommendedItem, reason } = await getSurpriseRecommendation());
            break;
        }
      } catch (apiError) {
        console.warn('API failed, using backup recommendations:', apiError.message);
        setUsingBackup(true);
        
        // Use backup system
        switch (mode) {
          case 'likes':
            ({ recommendedItem, reason } = await getBackupRecommendationBasedOnLikes());
            break;
          case 'filters':
            ({ recommendedItem, reason } = await getBackupRecommendationBasedOnFilters());
            break;
          case 'surprise':
            ({ recommendedItem, reason } = await getBackupSurpriseRecommendation());
            break;
        }
      }

      if (recommendedItem) {
        setRecommendation({ ...recommendedItem, reason });
        setCurrentStep('result');
      } else {
        throw new Error('No recommendations found matching your criteria. Try adjusting your preferences.');
      }

    } catch (err) {
      console.error('Recommendation error:', err);
      setError(err.message || 'Failed to generate recommendation. Please try again.');
      setCurrentStep('select');
    }
  };

  const getRecommendationBasedOnLikes = async () => {
    // Analyze user's saved items to find patterns
    const genreCounts = {};
    const typeCounts = { anime: 0, manga: 0, novel: 0 };

    savedItems.forEach(item => {
      // Count genres
      item.genres.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });

      // Count types
      typeCounts[item.type]++;
    });

    // Find most liked genres
    const sortedGenres = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([genre]) => genre);

    // Find preferred type
    const preferredType = Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)[0][0];

    // Search for recommendations
    const searchGenre = sortedGenres[0] || 'Action';
    const searchType = preferredType === 'novel' ? 'NOVEL' : preferredType.toUpperCase();
    
    const response = await AniListService.search(searchGenre, searchType, 1, 50);
    const candidates = response.media
      .map(AniListService.formatMediaItem)
      .filter(item => !savedItems.some(saved => saved.id === item.id)) // Exclude already saved
      .filter(item => item.score >= 70); // Only good ratings

    const recommendedItem = candidates[Math.floor(Math.random() * Math.min(candidates.length, 10))];
    
    const reason = `Based on your love for ${searchGenre} ${preferredType === 'novel' ? 'light novels' : preferredType}, and your saved library preferences.`;

    return { recommendedItem, reason };
  };

  const getRecommendationBasedOnFilters = async () => {
    const { genres, minRating, type } = filterOptions;
    
    // If no specific genres selected, use a broad search
    const searchGenre = genres.length > 0 ? genres[0] : 'Action';
    const searchType = type === 'all' ? 'ANIME' : type === 'novel' ? 'NOVEL' : type.toUpperCase();

    // Get more results to filter from
    const response = await AniListService.search(searchGenre, searchType, 1, 100);
    
    let candidates = response.media
      .map(AniListService.formatMediaItem)
      .filter(item => item.score >= minRating);

    // IMPORTANT: Filter by selected genres - must contain at least one selected genre
    if (genres.length > 0) {
      candidates = candidates.filter(item => 
        genres.some(selectedGenre => 
          item.genres.some(itemGenre => 
            itemGenre.toLowerCase().includes(selectedGenre.toLowerCase())
          )
        )
      );
    }

    // If we have multiple genres selected, prioritize items that match more genres
    if (genres.length > 1) {
      candidates.sort((a, b) => {
        const aMatches = genres.filter(selectedGenre => 
          a.genres.some(itemGenre => 
            itemGenre.toLowerCase().includes(selectedGenre.toLowerCase())
          )
        ).length;
        
        const bMatches = genres.filter(selectedGenre => 
          b.genres.some(itemGenre => 
            itemGenre.toLowerCase().includes(selectedGenre.toLowerCase())
          )
        ).length;
        
        return bMatches - aMatches; // Sort by most matches first
      });
    }

    if (candidates.length === 0) {
      throw new Error(`No ${type === 'all' ? 'content' : type} found matching your criteria. Try adjusting your filters.`);
    }

    // Pick from top matches for better relevance
    const topCandidates = candidates.slice(0, Math.min(15, candidates.length));
    const recommendedItem = topCandidates[Math.floor(Math.random() * topCandidates.length)];
    
    const reason = `Filtered by ${genres.length > 0 ? genres.join(', ') : 'your preferences'} with rating ${minRating}+ in ${type === 'all' ? 'all categories' : type}.`;

    return { recommendedItem, reason };
  };

  // Backup recommendation functions using static data
  const getBackupRecommendationBasedOnLikes = async () => {
    const recommendations = getBackupRecommendationsFromSaved(savedItems);
    
    if (recommendations.length === 0) {
      throw new Error('No recommendations available based on your saved items.');
    }
    
    const recommendedItem = recommendations[Math.floor(Math.random() * recommendations.length)];
    const reason = `Based on your saved library preferences (offline mode).`;
    
    return { recommendedItem, reason };
  };

  const getBackupRecommendationBasedOnFilters = async () => {
    const recommendations = getBackupRecommendations(filterOptions);
    
    if (recommendations.length === 0) {
      throw new Error(`No ${filterOptions.type === 'all' ? 'content' : filterOptions.type} found matching your criteria in our offline database.`);
    }
    
    const recommendedItem = recommendations[Math.floor(Math.random() * recommendations.length)];
    const reason = `Filtered by ${filterOptions.genres.length > 0 ? filterOptions.genres.join(', ') : 'your preferences'} with rating ${filterOptions.minRating}+ (offline mode).`;
    
    return { recommendedItem, reason };
  };

  const getBackupSurpriseRecommendation = async () => {
    const recommendedItem = getRandomBackupRecommendation();
    
    if (!recommendedItem) {
      throw new Error('No surprise recommendations available in offline mode.');
    }
    
    const reason = `A random surprise from our curated collection (offline mode)!`;
    
    return { recommendedItem, reason };
  };

  const getSurpriseRecommendation = async () => {
    const types = ['ANIME', 'NOVEL'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    const response = await AniListService.getTrending(randomType, 1, 50);
    const candidates = response.media.map(AniListService.formatMediaItem);
    
    const recommendedItem = candidates[Math.floor(Math.random() * candidates.length)];
    const reason = `A completely random surprise from trending ${randomType.toLowerCase() === 'novel' ? 'light novels' : 'anime'}!`;

    return { recommendedItem, reason };
  };

  const resetRecommendation = () => {
    setCurrentStep('select');
    setSelectedMode(null);
    setRecommendation(null);
    setError(null);
    setUsingBackup(false);
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    if (mode.id === 'filters') {
      setShowFilterModal(true);
    } else {
      generateRecommendation(mode.id);
    }
  };

  const handleFilterSubmit = () => {
    setShowFilterModal(false);
    generateRecommendation('filters');
  };

  // Authentication guard
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Please Sign In</h2>
          <p className="text-gray-400 mb-6">You need to be logged in to get recommendations</p>
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
    <PageTransition>
      <div className="min-h-screen bg-anime-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        
        {/* Step 1: Mode Selection */}
        {currentStep === 'select' && (
          <div className="text-center">
            {/* Header - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row items-center justify-center mb-6 sm:mb-8">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-anime-cyan mr-0 sm:mr-4 mb-2 sm:mb-0 animate-anime-pulse" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-anime-text-primary text-center">
                Get Your Next Read
              </h1>
            </div>
            
            <p className="text-base sm:text-lg lg:text-xl text-anime-text-secondary mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
              Let us find the perfect anime, manga, or light novel for you. Choose how you'd like us to recommend:
            </p>

            {error && (
              <div className="bg-anime-pink/20 border border-anime-pink/30 text-anime-pink px-4 sm:px-6 py-3 sm:py-4 rounded-xl mb-6 sm:mb-8 max-w-md mx-auto backdrop-blur-sm text-sm sm:text-base">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Connection Status Indicator */}
            <div className="flex items-center justify-center mb-6 sm:mb-8">
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                usingBackup 
                  ? 'bg-anime-gold/20 text-anime-gold border border-anime-gold/30' 
                  : 'bg-anime-green/20 text-anime-green border border-anime-green/30'
              }`}>
                {usingBackup ? (
                  <>
                    <WifiOff className="w-3 h-3" />
                    <span>Offline Mode - Using Curated Collection</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-3 h-3" />
                    <span>Online - Full Database Access</span>
                  </>
                )}
              </div>
            </div>

            {/* Mode Cards - Mobile First Design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
              {recommendationModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => !mode.disabled && handleModeSelect(mode)}
                    disabled={mode.disabled}
                    className={`
                      group p-4 sm:p-6 lg:p-8 rounded-2xl border transition-all duration-300 text-left anime-hover-lift w-full
                      ${mode.disabled 
                        ? 'bg-anime-card/30 border-anime-hover/30 cursor-not-allowed opacity-60' 
                        : `bg-anime-card/50 backdrop-blur-sm border-anime-hover hover:border-anime-cyan/50 hover:shadow-anime-glow-cyan/20 cursor-pointer`
                      }
                    `}
                  >
                    {/* Mobile: Horizontal layout, Desktop: Vertical */}
                    <div className="flex sm:block items-start sm:items-center">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-0 sm:mb-6 mr-4 sm:mr-0 flex-shrink-0 transition-all duration-300 ${
                        mode.disabled 
                          ? 'bg-anime-text-muted/20' 
                          : `bg-gradient-to-r ${mode.gradient} group-hover:shadow-anime-glow-cyan/50`
                      }`}>
                        <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${
                          mode.disabled ? 'text-anime-text-muted' : 'text-anime-dark'
                        }`} />
                      </div>
                      
                      <div className="flex-1 sm:text-center">
                        <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-anime-text-primary">
                          {mode.title}
                        </h3>
                        <p className="text-sm text-anime-text-secondary mb-3 sm:mb-6 leading-relaxed">
                          {mode.disabled ? mode.disabledMessage : mode.description}
                        </p>
                        {!mode.disabled && (
                          <div className="flex items-center justify-start sm:justify-center text-sm font-medium text-anime-cyan group-hover:text-anime-text-primary transition-colors">
                            <span>Choose this</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Loading Animation */}
        {currentStep === 'loading' && (
          <LoadingAnimation selectedMode={selectedMode} />
        )}

        {/* Step 3: Recommendation Result */}
        {currentStep === 'result' && recommendation && (
          <RecommendationResult 
            recommendation={recommendation} 
            onReset={resetRecommendation}
            onNewRecommendation={() => generateRecommendation(selectedMode.id)}
            usingBackup={usingBackup}
          />
        )}

        {/* Filter Modal */}
        {showFilterModal && (
          <FilterModal
            filterOptions={filterOptions}
            setFilterOptions={setFilterOptions}
            allGenres={allGenres}
            onSubmit={handleFilterSubmit}
            onClose={() => setShowFilterModal(false)}
          />
        )}
        </div>
      </div>
    </PageTransition>
  );
};

// Loading Animation Component - Mobile Optimized
const LoadingAnimation = ({ selectedMode }) => (
  <div className="text-center px-4">
    <div className="mb-6 sm:mb-8">
      {/* Animated Loading Circle */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 relative">
        <div className="absolute inset-0 border-4 border-anime-cyan/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-anime-cyan border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-1 sm:inset-2 bg-gradient-to-r from-anime-cyan to-anime-purple rounded-full flex items-center justify-center shadow-anime-glow-cyan">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-anime-dark animate-anime-pulse" />
        </div>
      </div>
      
      {/* Loading Text */}
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-anime-text-primary">
        Finding Your Perfect Match
      </h2>
      <p className="text-lg sm:text-xl text-anime-text-secondary mb-6">
        Analyzing {selectedMode?.title.toLowerCase()}...
      </p>
      
      {/* Progress Steps for Mobile */}
      <div className="max-w-sm mx-auto">
        <div className="flex justify-between text-xs sm:text-sm text-anime-text-muted mb-4">
          <span>Searching database</span>
          <span>Filtering results</span>
          <span>Finding match</span>
        </div>
        <div className="relative">
          <div className="h-1 bg-anime-hover/30 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-anime-cyan to-anime-purple rounded-full animate-pulse" 
                 style={{
                   width: '70%',
                   animation: 'loadingProgress 3s ease-in-out infinite'
                 }}>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Bouncing Dots */}
    <div className="flex justify-center space-x-1 sm:space-x-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-2 h-2 sm:w-3 sm:h-3 bg-anime-cyan rounded-full animate-bounce shadow-anime-glow-cyan/50"
          style={{ animationDelay: `${i * 0.15}s` }}
        ></div>
      ))}
    </div>
    
    {/* Loading Messages */}
    <div className="mt-8 max-w-md mx-auto">
      <div className="text-sm text-anime-text-secondary italic">
        {selectedMode?.id === 'likes' && "Analyzing your saved library preferences..."}
        {selectedMode?.id === 'filters' && "Matching your custom criteria..."}
        {selectedMode?.id === 'surprise' && "Discovering something completely new..."}
      </div>
    </div>
  </div>
);

// Recommendation Result Component - Mobile Optimized
const RecommendationResult = ({ recommendation, onReset, onNewRecommendation, usingBackup }) => (
  <div className="text-center px-4">
    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-anime-text-primary">
      Your Perfect Match
    </h2>
    
    <div className="max-w-4xl mx-auto bg-anime-card/50 backdrop-blur-sm border border-anime-hover rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
      <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8">
        <div className="relative flex-shrink-0">
          <img
            src={recommendation.cover}
            alt={recommendation.title}
            className="w-40 h-56 sm:w-48 sm:h-64 lg:w-56 lg:h-80 object-cover rounded-xl shadow-lg mx-auto"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-anime-dark/50 via-transparent to-transparent rounded-xl"></div>
          
          {/* Mobile Rating Badge */}
          {recommendation.score && (
            <div className="absolute top-2 right-2 bg-anime-card/90 backdrop-blur-sm border border-anime-gold/30 rounded-lg px-2 py-1 flex items-center space-x-1">
              <Star className="w-3 h-3 text-anime-gold fill-current" />
              <span className="text-xs font-bold text-anime-text-primary">{(recommendation.score / 10).toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center lg:text-left w-full">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-anime-text-primary leading-tight">
            {recommendation.title}
          </h3>
          
          {/* Desktop Rating */}
          {recommendation.score && (
            <div className="hidden lg:flex items-center mb-4">
              <Star className="w-5 h-5 text-anime-gold fill-current mr-2" />
              <span className="text-lg font-semibold text-anime-text-primary">{(recommendation.score / 10).toFixed(1)}/10</span>
            </div>
          )}
          
          {/* Genres */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-1 sm:gap-2 mb-4 sm:mb-6">
            {recommendation.genres.slice(0, 4).map((genre, index) => (
              <span
                key={index}
                className="px-2 sm:px-3 py-1 bg-anime-purple/20 text-anime-purple border border-anime-purple/30 rounded-lg text-xs sm:text-sm font-medium"
              >
                {genre}
              </span>
            ))}
          </div>
          
          {/* Recommendation Reason */}
          <div className="bg-anime-hover/20 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-anime-hover/30">
            <p className="text-sm sm:text-base text-anime-text-secondary italic leading-relaxed">
              "{recommendation.reason}"
            </p>
            {usingBackup && (
              <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-anime-hover/30">
                <WifiOff className="w-3 h-3 text-anime-gold" />
                <span className="text-xs text-anime-gold">
                  From curated offline collection
                </span>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`/explore/${recommendation.format === 'NOVEL' ? 'novel' : ['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL'].includes(recommendation.format) ? 'anime' : 'manga'}/${recommendation.id}`}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-anime-cyan to-anime-purple text-anime-dark py-3 px-4 sm:px-6 rounded-xl font-semibold hover:shadow-anime-glow-cyan transition-all duration-300 anime-hover-lift text-sm sm:text-base"
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>View Details</span>
            </a>
            
            <button
              onClick={() => SavedItemsManager.saveItem(recommendation)}
              className="flex items-center justify-center space-x-2 bg-anime-card/50 backdrop-blur-sm border border-anime-cyan text-anime-cyan py-3 px-4 sm:px-6 rounded-xl font-semibold hover:bg-anime-cyan hover:text-anime-dark hover:shadow-anime-glow-cyan transition-all duration-300 anime-hover-lift text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Add to Library</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    {/* Bottom Action Buttons */}
    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-md mx-auto">
      <button
        onClick={onNewRecommendation}
        className="flex items-center justify-center space-x-2 bg-anime-card/50 backdrop-blur-sm border border-anime-purple text-anime-purple px-4 sm:px-6 py-3 rounded-xl font-semibold hover:bg-anime-purple hover:text-anime-dark hover:shadow-anime-glow-purple transition-all duration-300 anime-hover-lift text-sm sm:text-base"
      >
        <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Another Suggestion</span>
      </button>
      
      <button
        onClick={onReset}
        className="flex items-center justify-center space-x-2 bg-anime-card/50 backdrop-blur-sm border border-anime-hover text-anime-text-secondary px-4 sm:px-6 py-3 rounded-xl font-semibold hover:border-anime-text-primary hover:text-anime-text-primary transition-all duration-300 anime-hover-lift text-sm sm:text-base"
      >
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transform rotate-180" />
        <span>Start Over</span>
      </button>
    </div>
  </div>
);

// Filter Modal Component - Mobile Optimized
const FilterModal = ({ filterOptions, setFilterOptions, allGenres, onSubmit, onClose }) => (
  <div className="fixed inset-0 bg-anime-dark/90 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
    <div className="bg-anime-card backdrop-blur-sm border-t border-anime-hover sm:border sm:border-anime-hover rounded-t-3xl sm:rounded-2xl w-full sm:w-auto sm:max-w-lg sm:min-w-[28rem] max-h-[90vh] overflow-hidden shadow-2xl">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-anime-hover/30">
        <h3 className="text-lg sm:text-xl font-bold text-anime-text-primary">Customize Recommendation</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-anime-hover/50 flex items-center justify-center text-anime-text-muted hover:text-anime-text-primary hover:bg-anime-hover transition-all duration-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-4 sm:p-6">
        {/* Content Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-anime-text-primary">Content Type</label>
          <select
            value={filterOptions.type}
            onChange={(e) => setFilterOptions(prev => ({ ...prev, type: e.target.value }))}
            className="w-full p-3 sm:p-3 bg-anime-hover/30 border border-anime-hover rounded-xl text-anime-text-primary focus:border-anime-cyan focus:shadow-anime-glow-cyan/50 outline-none transition-all duration-300 text-base"
          >
            <option value="all">All Types</option>
            <option value="anime">Anime</option>
            <option value="manga">Manga</option>
            <option value="novel">Light Novels</option>
          </select>
        </div>
        
        {/* Minimum Rating */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-anime-text-primary">
            Minimum Rating: <span className="text-anime-cyan font-bold">{filterOptions.minRating}%</span>
          </label>
          <div className="px-2">
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={filterOptions.minRating}
              onChange={(e) => setFilterOptions(prev => ({ ...prev, minRating: parseInt(e.target.value) }))}
              className="w-full h-2 bg-anime-hover/30 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-anime-text-muted mt-2">
              <span>50% (Okay)</span>
              <span>95% (Masterpiece)</span>
            </div>
          </div>
        </div>
        
        {/* Genres */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-anime-text-primary">
            Preferred Genres 
            <span className="text-anime-text-muted"> (select up to 3)</span>
          </label>
          
          {/* Selected Genres Display */}
          {filterOptions.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-anime-hover/20 rounded-xl border border-anime-hover/30">
              {filterOptions.genres.map((genre) => (
                <span
                  key={genre}
                  className="flex items-center space-x-1 px-3 py-1 bg-anime-cyan/20 text-anime-cyan border border-anime-cyan/30 rounded-lg text-sm font-medium"
                >
                  <span>{genre}</span>
                  <button
                    onClick={() => setFilterOptions(prev => ({
                      ...prev,
                      genres: prev.genres.filter(g => g !== genre)
                    }))}
                    className="w-4 h-4 rounded-full bg-anime-cyan/20 flex items-center justify-center hover:bg-anime-cyan/40 transition-colors"
                  >
                    <X className="w-2 h-2" />
                  </button>
                </span>
              ))}
            </div>
          )}
          
          {/* Genre Grid - Mobile Optimized */}
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
            {allGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => {
                  if (filterOptions.genres.includes(genre)) {
                    setFilterOptions(prev => ({
                      ...prev,
                      genres: prev.genres.filter(g => g !== genre)
                    }));
                  } else if (filterOptions.genres.length < 3) {
                    setFilterOptions(prev => ({
                      ...prev,
                      genres: [...prev.genres, genre]
                    }));
                  }
                }}
                disabled={!filterOptions.genres.includes(genre) && filterOptions.genres.length >= 3}
                className={`p-3 rounded-xl text-left transition-all duration-300 ${
                  filterOptions.genres.includes(genre)
                    ? 'bg-anime-cyan/20 border-2 border-anime-cyan text-anime-cyan'
                    : filterOptions.genres.length >= 3
                    ? 'bg-anime-hover/20 border border-anime-hover/30 text-anime-text-muted opacity-50 cursor-not-allowed'
                    : 'bg-anime-hover/20 border border-anime-hover/30 text-anime-text-secondary hover:border-anime-cyan/50 hover:text-anime-text-primary'
                }`}
              >
                <span className="text-sm font-medium">{genre}</span>
              </button>
            ))}
          </div>
          
          <p className="text-xs text-anime-text-muted mt-3 text-center">
            {filterOptions.genres.length}/3 genres selected
          </p>
        </div>
      </div>
      
      {/* Footer Buttons */}
      <div className="p-4 sm:p-6 border-t border-anime-hover/30 bg-anime-card/50">
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={onSubmit}
            className="flex-1 bg-gradient-to-r from-anime-cyan to-anime-purple text-anime-dark py-3 px-4 rounded-xl font-semibold hover:shadow-anime-glow-cyan transition-all duration-300 anime-hover-lift text-base"
          >
            Get Recommendation
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-anime-card/50 backdrop-blur-sm border border-anime-hover text-anime-text-secondary py-3 px-4 rounded-xl font-semibold hover:border-anime-text-primary hover:text-anime-text-primary transition-all duration-300 anime-hover-lift text-base"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default Recommendations;