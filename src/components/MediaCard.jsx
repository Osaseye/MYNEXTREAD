import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Calendar, BookOpen, Tv, Sparkles } from 'lucide-react';

const MediaCard = ({ media, onClick }) => {
  const navigate = useNavigate();
  
  const getFormatIcon = (format) => {
    switch (format) {
      case 'TV':
      case 'MOVIE':
      case 'OVA':
      case 'ONA':
      case 'SPECIAL':
        return <Tv className="w-4 h-4" />;
      case 'MANGA':
      case 'ONE_SHOT':
        return <BookOpen className="w-4 h-4" />;
      case 'NOVEL':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'RELEASING':
        return 'Ongoing';
      case 'FINISHED':
        return 'Completed';
      case 'NOT_YET_RELEASED':
        return 'Upcoming';
      case 'CANCELLED':
        return 'Cancelled';
      case 'HIATUS':
        return 'On Hiatus';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'RELEASING':
        return 'bg-anime-green/20 text-anime-green border-anime-green/30';
      case 'FINISHED':
        return 'bg-anime-cyan/20 text-anime-cyan border-anime-cyan/30';
      case 'NOT_YET_RELEASED':
        return 'bg-anime-gold/20 text-anime-gold border-anime-gold/30';
      case 'CANCELLED':
        return 'bg-anime-pink/20 text-anime-pink border-anime-pink/30';
      case 'HIATUS':
        return 'bg-anime-purple/20 text-anime-purple border-anime-purple/30';
      default:
        return 'bg-anime-text-muted/20 text-anime-text-muted border-anime-text-muted/30';
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(media);
    } else {
      // Determine type from format
      let type = 'manga'; // default
      if (['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL'].includes(media.format)) {
        type = 'anime';
      } else if (['NOVEL'].includes(media.format)) {
        type = 'novel';
      }
      navigate(`/explore/${type}/${media.id}`);
    }
  };

  return (
    <div
      className="group relative bg-anime-card/80 backdrop-blur-sm rounded-xl shadow-anime-card overflow-hidden cursor-pointer anime-hover-lift border border-anime-purple/20 hover:border-anime-cyan/40 transition-all duration-300"
      onClick={handleClick}
    >
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-anime-cyan/5 via-transparent to-anime-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Cover Image */}
      <div className="aspect-[3/4] relative overflow-hidden">
        <img
          src={media.cover}
          alt={media.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-anime-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Score Badge */}
        {media.score && (
          <div className="absolute top-3 right-3 bg-anime-dark/90 backdrop-blur-sm text-anime-text-primary px-2 py-1 rounded-lg flex items-center space-x-1 border border-anime-gold/30 shadow-anime-glow-purple">
            <Star className="w-3 h-3 fill-current text-anime-gold animate-anime-pulse" />
            <span className="text-xs font-bold">{(media.score / 10).toFixed(1)}</span>
          </div>
        )}
        
        {/* Format Badge */}
        <div className="absolute top-3 left-3 bg-anime-card/90 backdrop-blur-sm text-anime-cyan px-2 py-1 rounded-lg flex items-center space-x-1 border border-anime-cyan/30">
          {getFormatIcon(media.format)}
          <span className="text-xs font-medium">{media.format}</span>
        </div>
        
        {/* Sparkle Effect on High Scores */}
        {media.score && media.score >= 80 && (
          <div className="absolute top-1 right-1">
            <Sparkles className="w-4 h-4 text-anime-gold animate-anime-pulse" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-sm text-anime-text-primary mb-2 line-clamp-2 leading-tight group-hover:text-anime-cyan transition-colors duration-300">
          {media.title}
        </h3>
        
        {/* Status and Year */}
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="flex items-center space-x-1 text-anime-text-secondary">
            <Calendar className="w-3 h-3" />
            <span>{media.year || 'TBA'}</span>
          </span>
          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(media.status)}`}>
            {formatStatus(media.status)}
          </span>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1">
          {media.genres.slice(0, 2).map((genre, index) => (
            <span
              key={index}
              className="text-xs bg-anime-purple/20 text-anime-purple px-2 py-1 rounded-md border border-anime-purple/30 font-medium hover:bg-anime-purple/30 transition-colors duration-200"
            >
              {genre}
            </span>
          ))}
          {media.genres.length > 2 && (
            <span className="text-xs text-anime-text-muted bg-anime-text-muted/10 px-2 py-1 rounded-md border border-anime-text-muted/20">
              +{media.genres.length - 2}
            </span>
          )}
        </div>
      </div>
      
      {/* Bottom Glow Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-anime-cyan to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export default MediaCard;