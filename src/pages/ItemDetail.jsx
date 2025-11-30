import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, PlayCircle, BookOpen, ExternalLink, Heart, Share2, Plus, ThumbsUp, Sparkles } from 'lucide-react';
import AniListService from '../services/anilist';
import YouTubeService from '../services/youtube';
import { LoadingState, cleanHtml } from '../utils/hooks';
import { SavedItemsManager } from '../utils/savedItems';
import { getPlatformsForMedia, getSearchUrl } from '../utils/platforms';
import ActivityManager from '../utils/activityManager';

const ItemDetail = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(LoadingState.IDLE);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchMediaDetail = async () => {
      setLoading(LoadingState.LOADING);
      setError(null);

      try {
        const response = await AniListService.getMediaDetail(id, type);
        const formattedMedia = AniListService.formatMediaItem(response);
        // Add additional detail fields
        formattedMedia.tags = response.tags || [];
        formattedMedia.characters = response.characters?.edges || [];
        formattedMedia.relations = response.relations?.edges || [];
        formattedMedia.recommendations = response.recommendations?.nodes || [];
        formattedMedia.externalLinks = response.externalLinks || [];
        formattedMedia.streamingEpisodes = response.streamingEpisodes || [];
        
        // Get trailer (try AniList first, then fallback to YouTube search)
        const trailer = await YouTubeService.getTrailer(
          response.trailer, 
          formattedMedia.title.english || formattedMedia.title.romaji,
          type
        );
        formattedMedia.trailer = trailer;
        
        formattedMedia.popularity = response.popularity;
        formattedMedia.favourites = response.favourites;
        formattedMedia.duration = response.duration;
        formattedMedia.source = response.source;
        formattedMedia.season = response.season;
        formattedMedia.seasonYear = response.seasonYear;
        formattedMedia.endDate = response.endDate;
        
        setMedia(formattedMedia);
        setIsSaved(SavedItemsManager.isItemSaved(formattedMedia.id));
        setLoading(LoadingState.SUCCESS);
      } catch (err) {
        console.error('Error fetching media detail:', err);
        setError('Failed to load media details');
        setLoading(LoadingState.ERROR);
      }
    };

    if (id && type) {
      fetchMediaDetail();
    }
  }, [id, type]);

  const formatStatus = (status) => {
    switch (status) {
      case 'RELEASING': return 'Ongoing';
      case 'FINISHED': return 'Completed';
      case 'NOT_YET_RELEASED': return 'Upcoming';
      case 'CANCELLED': return 'Cancelled';
      case 'HIATUS': return 'On Hiatus';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'RELEASING': return 'bg-anime-green/20 text-anime-green border-anime-green/30';
      case 'FINISHED': return 'bg-anime-cyan/20 text-anime-cyan border-anime-cyan/30';
      case 'NOT_YET_RELEASED': return 'bg-anime-gold/20 text-anime-gold border-anime-gold/30';
      case 'CANCELLED': return 'bg-anime-pink/20 text-anime-pink border-anime-pink/30';
      case 'HIATUS': return 'bg-anime-purple/20 text-anime-purple border-anime-purple/30';
      default: return 'bg-anime-text-muted/20 text-anime-text-muted border-anime-text-muted/30';
    }
  };

  const handleSaveToggle = () => {
    if (media) {
      const success = SavedItemsManager.toggleSave(media);
      if (success) {
        setIsSaved(!isSaved);
        // Add activity when saving (not removing)
        if (!isSaved) {
          ActivityManager.addActivity('SAVED', media);
        }
      }
    }
  };

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    // Add activity when liking (not unliking)
    if (!isLiked && media) {
      ActivityManager.addActivity('LIKED', media);
    }
    // TODO: In future, this could sync with a backend
  };

  const handleShare = () => {
    if (navigator.share && media) {
      navigator.share({
        title: media.title,
        text: `Check out ${media.title} on MyNextRead`,
        url: window.location.href,
      });
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading === LoadingState.LOADING) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-anime-pulse">
            <div className="h-8 bg-anime-card/50 rounded-xl w-32 mb-6"></div>
            <div className="h-64 lg:h-96 bg-anime-card/50 rounded-2xl mb-8"></div>
            <div className="space-y-4">
              <div className="h-8 bg-anime-card/50 rounded-xl w-3/4"></div>
              <div className="h-4 bg-anime-card/30 rounded-lg w-full"></div>
              <div className="h-4 bg-anime-card/30 rounded-lg w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading === LoadingState.ERROR || !media) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-anime-card/50 backdrop-blur-sm border border-anime-pink/30 rounded-2xl p-8 max-w-md mx-4">
          <div className="text-anime-pink text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-anime-text-primary mb-2">Error Loading Media</h2>
          <p className="text-anime-text-secondary mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-anime-cyan to-anime-purple px-6 py-3 rounded-lg text-anime-dark font-semibold hover:shadow-anime-glow-cyan transition-all duration-300 anime-hover-lift"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center space-x-2 bg-anime-card/50 backdrop-blur-sm border border-anime-purple/30 px-4 py-2 rounded-xl text-anime-text-primary hover:text-anime-cyan hover:border-anime-cyan/50 font-medium transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Explore</span>
        </button>
      </div>

      {/* Banner Section - Desktop Only */}
      {media.banner && (
        <div 
          className="hidden lg:block h-80 bg-cover bg-center relative rounded-b-3xl mx-4 sm:mx-6 lg:mx-8 overflow-hidden"
          style={{ backgroundImage: `url(${media.banner})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-anime-dark via-anime-dark/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-anime-cyan/10 via-transparent to-anime-purple/10"></div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Mobile Image with Action Buttons Overlay */}
          <div className="relative mb-6">
            <img
              src={media.cover}
              alt={media.title}
              className="w-48 h-72 mx-auto rounded-lg shadow-lg object-cover"
            />
            
            {/* Action Buttons - Icons Only, Positioned on Top */}
            <div className="absolute top-3 right-3 flex flex-col space-y-2">
              <button 
                onClick={handleLikeToggle}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isLiked 
                    ? 'bg-gradient-to-r from-anime-pink to-anime-purple text-anime-dark shadow-anime-glow-pink' 
                    : 'bg-anime-card/80 backdrop-blur-sm border border-anime-pink/30 text-anime-pink hover:shadow-anime-glow-pink/50'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>

              <button 
                onClick={handleSaveToggle}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isSaved 
                    ? 'bg-gradient-to-r from-anime-green to-anime-cyan text-anime-dark shadow-anime-glow-cyan' 
                    : 'bg-gradient-to-r from-anime-cyan to-anime-purple text-anime-dark hover:shadow-anime-glow-cyan'
                }`}
              >
                {isSaved ? (
                  <Heart className="w-4 h-4 fill-current" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>
            
              <button 
                onClick={handleShare}
                className="w-10 h-10 rounded-full bg-anime-card/80 backdrop-blur-sm border border-anime-purple/30 text-anime-text-primary flex items-center justify-center hover:border-anime-purple/60 hover:shadow-anime-glow-purple/50 transition-all duration-300"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Title and Basic Info */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-anime-text-primary mb-2">{media.title}</h1>
            {media.nativeTitle && media.nativeTitle !== media.title && (
              <p className="text-sm text-anime-text-secondary mb-3">{media.nativeTitle}</p>
            )}
            
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {media.score && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-current text-anime-gold" />
                  <span className="font-semibold text-anime-text-primary text-sm">{(media.score / 10).toFixed(1)}</span>
                </div>
              )}
              
              <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(media.status)}`}>
                {formatStatus(media.status)}
              </span>
              
              <div className="flex items-center space-x-1 text-anime-text-secondary">
                <Calendar className="w-3 h-3" />
                <span className="text-xs">{media.year || 'TBA'}</span>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap justify-center gap-1 mb-4">
              {media.genres.slice(0, 4).map((genre, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-anime-purple/20 text-anime-purple rounded-lg text-xs font-medium border border-anime-purple/30"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Synopsis */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-anime-text-primary mb-3">Synopsis</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-anime-text-secondary leading-relaxed text-sm">
                {cleanHtml(media.description) || 'No description available.'}
              </p>
            </div>
          </div>

          {/* Platform Links */}
          <div className="mb-6">
            <h3 className="font-semibold text-anime-text-primary mb-3 text-base">
              {['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL'].includes(media.format) 
                ? 'Watch On' 
                : ['NOVEL'].includes(media.format)
                ? 'Read Novels On'
                : 'Read On'}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {getPlatformsForMedia(media.format).slice(0, 6).map((platform, index) => (
                <a
                  key={index}
                  href={getSearchUrl(platform, media.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center space-x-2 px-3 py-3 bg-anime-card/50 border border-anime-hover rounded-lg hover:border-anime-cyan/50 hover:bg-anime-hover/50 transition-all duration-300"
                >
                  {platform.logo ? (
                    <img 
                      src={platform.logo} 
                      alt={platform.name}
                      className="w-5 h-5 object-contain rounded"
                    />
                  ) : (
                    <div className="w-5 h-5 bg-anime-cyan/20 rounded flex items-center justify-center">
                      <span className="text-xs text-anime-cyan font-bold">
                        {platform.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-anime-text-secondary group-hover:text-anime-text-primary">
                    {platform.name}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* External Links from API (if available) */}
          {media.externalLinks && media.externalLinks.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-anime-text-primary mb-3 text-base">Official Links</h3>
              <div className="grid grid-cols-2 gap-2">
                {media.externalLinks.slice(0, 4).map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-3 py-3 bg-anime-card/50 border border-anime-hover rounded-lg hover:border-anime-purple/50 hover:bg-anime-hover/50 transition-all duration-300"
                  >
                    <ExternalLink className="w-4 h-4 text-anime-text-muted" />
                    <span className="text-sm font-medium text-anime-text-secondary">{link.site}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Additional Details - Mobile */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h3 className="text-lg font-bold text-anime-text-primary mb-3">Details</h3>
              <div className="space-y-2">
                {media.episodes && (
                  <div className="flex justify-between">
                    <span className="text-anime-text-muted text-sm">Episodes:</span>
                    <span className="font-medium text-anime-text-primary text-sm">{media.episodes}</span>
                  </div>
                )}
                {media.chapters && (
                  <div className="flex justify-between">
                    <span className="text-anime-text-muted text-sm">Chapters:</span>
                    <span className="font-medium text-anime-text-primary text-sm">{media.chapters}</span>
                  </div>
                )}
                {media.volumes && (
                  <div className="flex justify-between">
                    <span className="text-anime-text-muted text-sm">Volumes:</span>
                    <span className="font-medium text-anime-text-primary text-sm">{media.volumes}</span>
                  </div>
                )}
                {media.duration && (
                  <div className="flex justify-between">
                    <span className="text-anime-text-muted text-sm">Duration:</span>
                    <span className="font-medium text-anime-text-primary text-sm">{media.duration} min</span>
                  </div>
                )}
                {media.studios && media.studios.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-anime-text-muted text-sm">Studio:</span>
                    <span className="font-medium text-anime-text-primary text-sm">{media.studios.slice(0, 2).join(', ')}</span>
                  </div>
                )}
                {media.popularity && (
                  <div className="flex justify-between">
                    <span className="text-anime-text-muted text-sm">Popularity:</span>
                    <span className="font-medium text-anime-text-primary text-sm">#{media.popularity}</span>
                  </div>
                )}
                {media.favourites && (
                  <div className="flex justify-between">
                    <span className="text-anime-text-muted text-sm">Favorites:</span>
                    <span className="font-medium text-anime-text-primary text-sm">{media.favourites.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trailer Section - Mobile (Only for Anime) */}
          {media.trailer && media.type === 'ANIME' && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-anime-text-primary mb-3 flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-anime-cyan" />
                Trailer
              </h2>
              <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-anime-hover/30 bg-black shadow-lg hover:border-anime-cyan/50 transition-all">
                {media.trailer.site === 'youtube' && media.trailer.id && (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${media.trailer.id}`}
                    title="Anime Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
                {media.trailer.site === 'dailymotion' && media.trailer.id && (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.dailymotion.com/embed/video/${media.trailer.id}`}
                    title="Anime Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            </div>
          )}

          {/* More Like This Section - Mobile */}
          {media.recommendations && media.recommendations.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-anime-text-primary mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-anime-cyan" />
                More Like This
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {media.recommendations.slice(0, 6).map((rec, index) => {
                  const recommendation = rec.mediaRecommendation;
                  if (!recommendation) return null;
                  
                  return (
                    <div
                      key={recommendation.id || index}
                      onClick={() => navigate(`/detail/${recommendation.type?.toLowerCase() || 'anime'}/${recommendation.id}`)}
                      className="group cursor-pointer"
                    >
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden border-2 border-anime-hover/30 bg-anime-secondary group-hover:border-anime-cyan/50 transition-all shadow-lg group-hover:shadow-anime-glow-cyan/30 group-hover:scale-105 transform duration-300">
                        {recommendation.coverImage?.medium && (
                          <img
                            src={recommendation.coverImage.medium}
                            alt={recommendation.title?.english || recommendation.title?.romaji || 'Recommendation'}
                            className="w-full h-full object-cover"
                          />
                        )}
                        
                        {/* Score Badge */}
                        {recommendation.averageScore && (
                          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1 border border-anime-cyan/30">
                            <Star className="w-3 h-3 text-anime-yellow fill-anime-yellow" />
                            <span className="text-xs font-bold text-white">
                              {recommendation.averageScore}
                            </span>
                          </div>
                        )}
                        
                        {/* Overlay on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                          <div className="text-white">
                            <h3 className="font-semibold text-xs line-clamp-2 mb-1">
                              {recommendation.title?.english || recommendation.title?.romaji || 'Unknown'}
                            </h3>
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="px-2 py-0.5 bg-anime-cyan/20 text-anime-cyan rounded border border-anime-cyan/30 text-[10px]">
                                {recommendation.format || recommendation.type || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-col lg:flex-row gap-8">
          {/* Left Column - Cover and Actions */}
          <div className="lg:w-1/3">
            <div className="sticky top-8">
              <img
                src={media.cover}
                alt={media.title}
                className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
              />
              
              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button 
                  onClick={handleLikeToggle}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isLiked 
                      ? 'bg-gradient-to-r from-anime-pink to-anime-purple text-anime-dark shadow-anime-glow-pink anime-hover-lift' 
                      : 'bg-anime-card/50 backdrop-blur-sm border border-anime-pink/30 text-anime-pink hover:border-anime-pink/60 hover:shadow-anime-glow-pink/30 anime-hover-glow'
                  }`}
                >
                  <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current animate-anime-pulse' : ''}`} />
                  <span>{isLiked ? 'Liked' : 'Like'}</span>
                </button>

                <button 
                  onClick={handleSaveToggle}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isSaved 
                      ? 'bg-gradient-to-r from-anime-green to-anime-cyan text-anime-dark shadow-anime-glow-cyan anime-hover-lift' 
                      : 'bg-gradient-to-r from-anime-cyan to-anime-purple text-anime-dark hover:shadow-anime-glow-cyan anime-hover-lift'
                  }`}
                >
                  {isSaved ? (
                    <Heart className="w-5 h-5 fill-current animate-anime-pulse" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  <span>{isSaved ? 'In Library' : 'Add to Library'}</span>
                </button>
              
                <button 
                  onClick={handleShare}
                  className="w-full bg-anime-card/50 backdrop-blur-sm border border-anime-purple/30 text-anime-text-primary py-3 px-4 rounded-xl font-semibold hover:border-anime-purple/60 hover:shadow-anime-glow-purple/30 transition-all duration-300 flex items-center justify-center space-x-2 anime-hover-glow"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>

              {/* Platform Links */}
              <div className="mt-6">
                <h3 className="font-semibold text-anime-text-primary mb-3 text-sm">
                  {['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL'].includes(media.format) 
                    ? 'Watch On' 
                    : ['NOVEL'].includes(media.format)
                    ? 'Read Novels On'
                    : 'Read On'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {getPlatformsForMedia(media.format).slice(0, 6).map((platform, index) => (
                    <a
                      key={index}
                      href={getSearchUrl(platform, media.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center space-x-2 px-3 py-2 bg-anime-card/50 border border-anime-hover rounded-lg hover:border-anime-cyan/50 hover:bg-anime-hover/50 transition-all duration-300"
                    >
                      {platform.logo ? (
                        <img 
                          src={platform.logo} 
                          alt={platform.name}
                          className="w-4 h-4 object-contain rounded"
                        />
                      ) : (
                        <div className="w-4 h-4 bg-anime-cyan/20 rounded flex items-center justify-center">
                          <span className="text-xs text-anime-cyan font-bold">
                            {platform.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="text-xs font-medium text-anime-text-secondary group-hover:text-anime-text-primary">
                        {platform.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* External Links from API (if available) */}
              {media.externalLinks && media.externalLinks.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-anime-text-primary mb-2 text-sm">Official Links</h3>
                  <div className="flex flex-wrap gap-2">
                    {media.externalLinks.slice(0, 4).map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 px-2 py-1 bg-anime-card/50 border border-anime-hover rounded-lg hover:border-anime-purple/50 hover:bg-anime-hover/50 transition-all duration-300"
                      >
                        <ExternalLink className="w-3 h-3 text-anime-text-muted" />
                        <span className="text-xs font-medium text-anime-text-secondary">{link.site}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:w-2/3">
            {/* Title and Basic Info */}
            <div className="mb-4">
              <h1 className="text-3xl lg:text-4xl font-bold text-anime-text-primary mb-2">{media.title}</h1>
              {media.nativeTitle && media.nativeTitle !== media.title && (
                <p className="text-lg text-anime-text-secondary mb-3">{media.nativeTitle}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {media.score && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-current text-anime-gold" />
                    <span className="font-semibold text-anime-text-primary">{(media.score / 10).toFixed(1)}</span>
                  </div>
                )}
                
                <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(media.status)}`}>
                  {formatStatus(media.status)}
                </span>
                
                <div className="flex items-center space-x-1 text-anime-text-secondary">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{media.year || 'TBA'}</span>
                </div>
                
                {media.format && (
                  <div className="flex items-center space-x-1 text-anime-text-secondary">
                    {media.format === 'TV' || media.format === 'MOVIE' ? (
                      <PlayCircle className="w-4 h-4" />
                    ) : (
                      <BookOpen className="w-4 h-4" />
                    )}
                    <span className="text-sm">{media.format}</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-4">
                {media.genres.slice(0, 5).map((genre, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-anime-purple/20 text-anime-purple rounded-lg text-xs font-medium border border-anime-purple/30"
                  >
                    {genre}
                  </span>
                ))}
                {media.genres.length > 5 && (
                  <span className="px-2 py-1 bg-anime-text-muted/20 text-anime-text-muted rounded-lg text-xs">
                    +{media.genres.length - 5} more
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-anime-text-primary mb-3">Synopsis</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-anime-text-secondary leading-relaxed text-sm line-clamp-4">
                  {cleanHtml(media.description) || 'No description available.'}
                </p>
              </div>
            </div>



            {/* Additional Details */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-anime-text-primary mb-3">Details</h3>
                <div className="space-y-1.5">
                  {media.episodes && (
                    <div className="flex justify-between">
                      <span className="text-anime-text-muted text-sm">Episodes:</span>
                      <span className="font-medium text-anime-text-primary text-sm">{media.episodes}</span>
                    </div>
                  )}
                  {media.chapters && (
                    <div className="flex justify-between">
                      <span className="text-anime-text-muted text-sm">Chapters:</span>
                      <span className="font-medium text-anime-text-primary text-sm">{media.chapters}</span>
                    </div>
                  )}
                  {media.volumes && (
                    <div className="flex justify-between">
                      <span className="text-anime-text-muted text-sm">Volumes:</span>
                      <span className="font-medium text-anime-text-primary text-sm">{media.volumes}</span>
                    </div>
                  )}
                  {media.duration && (
                    <div className="flex justify-between">
                      <span className="text-anime-text-muted text-sm">Duration:</span>
                      <span className="font-medium text-anime-text-primary text-sm">{media.duration} min</span>
                    </div>
                  )}
                  {media.studios && media.studios.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-anime-text-muted text-sm">Studio:</span>
                      <span className="font-medium text-anime-text-primary text-sm">{media.studios.slice(0, 2).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-anime-text-primary mb-3">Stats</h3>
                <div className="space-y-1.5">
                  {media.popularity && (
                    <div className="flex justify-between">
                      <span className="text-anime-text-muted text-sm">Popularity:</span>
                      <span className="font-medium text-anime-text-primary text-sm">#{media.popularity}</span>
                    </div>
                  )}
                  {media.favourites && (
                    <div className="flex justify-between">
                      <span className="text-anime-text-muted text-sm">Favorites:</span>
                      <span className="font-medium text-anime-text-primary text-sm">{media.favourites.toLocaleString()}</span>
                    </div>
                  )}
                  {media.source && (
                    <div className="flex justify-between">
                      <span className="text-anime-text-muted text-sm">Source:</span>
                      <span className="font-medium text-anime-text-primary text-sm">{media.source}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Trailer Section - Only for Anime */}
            {media.trailer && media.type === 'ANIME' && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-anime-text-primary mb-3 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-anime-cyan" />
                  Trailer
                </h2>
                <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-anime-hover/30 bg-black shadow-lg hover:border-anime-cyan/50 transition-all">
                  {media.trailer.site === 'youtube' && media.trailer.id && (
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${media.trailer.id}`}
                      title="Anime Trailer"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                  {media.trailer.site === 'dailymotion' && media.trailer.id && (
                    <iframe
                      className="w-full h-full"
                      src={`https://www.dailymotion.com/embed/video/${media.trailer.id}`}
                      title="Anime Trailer"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            )}

            {/* More Like This Section */}
            {media.recommendations && media.recommendations.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-anime-text-primary mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-anime-cyan" />
                  More Like This
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {media.recommendations.slice(0, 10).map((rec, index) => {
                    const recommendation = rec.mediaRecommendation;
                    if (!recommendation) return null;
                    
                    return (
                      <div
                        key={recommendation.id || index}
                        onClick={() => navigate(`/detail/${recommendation.type?.toLowerCase() || 'anime'}/${recommendation.id}`)}
                        className="group cursor-pointer"
                      >
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden border-2 border-anime-hover/30 bg-anime-secondary group-hover:border-anime-cyan/50 transition-all shadow-lg group-hover:shadow-anime-glow-cyan/30 group-hover:scale-105 transform duration-300">
                          {recommendation.coverImage?.medium && (
                            <img
                              src={recommendation.coverImage.medium}
                              alt={recommendation.title?.english || recommendation.title?.romaji || 'Recommendation'}
                              className="w-full h-full object-cover"
                            />
                          )}
                          
                          {/* Score Badge */}
                          {recommendation.averageScore && (
                            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1 border border-anime-cyan/30">
                              <Star className="w-3 h-3 text-anime-yellow fill-anime-yellow" />
                              <span className="text-xs font-bold text-white">
                                {recommendation.averageScore}
                              </span>
                            </div>
                          )}
                          
                          {/* Overlay on Hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                            <div className="text-white">
                              <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                                {recommendation.title?.english || recommendation.title?.romaji || 'Unknown'}
                              </h3>
                              <div className="flex items-center space-x-2 text-xs">
                                <span className="px-2 py-0.5 bg-anime-cyan/20 text-anime-cyan rounded border border-anime-cyan/30">
                                  {recommendation.format || recommendation.type || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;