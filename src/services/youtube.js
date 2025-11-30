// YouTube API Service for fetching trailers
// Using YouTube Data API v3

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

class YouTubeService {
  /**
   * Search for anime/manga trailer on YouTube
   * @param {string} title - The title of the anime/manga
   * @param {string} type - ANIME or MANGA
   * @returns {Promise<Object|null>} - Video data or null if not found
   */
  static async searchTrailer(title, type = 'ANIME') {
    try {
      // Create search query - add "trailer" and type for better results
      const searchQuery = `${title} ${type.toLowerCase()} trailer official`;
      
      const response = await fetch(
        `${YOUTUBE_API_BASE_URL}/search?` +
        `part=snippet&` +
        `q=${encodeURIComponent(searchQuery)}&` +
        `type=video&` +
        `maxResults=1&` +
        `key=${YOUTUBE_API_KEY}` 
      );

      if (!response.ok) {
        console.error('YouTube API error:', response.status);
        return null;
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        console.log('No YouTube trailer found for:', title);
        return null;
      }

      const video = data.items[0];
      
      return {
        id: video.id.videoId,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${video.id.videoId}`,
        site: 'youtube'
      };
    } catch (error) {
      console.error('Error fetching YouTube trailer:', error);
      return null;
    }
  }

  /**
   * Get multiple trailer options
   * @param {string} title - The title of the anime/manga
   * @param {string} type - ANIME or MANGA
   * @param {number} maxResults - Maximum number of results
   * @returns {Promise<Array>} - Array of video data
   */
  static async searchMultipleTrailers(title, type = 'ANIME', maxResults = 3) {
    try {
      const searchQuery = `${title} ${type.toLowerCase()} trailer`;
      
      const response = await fetch(
        `${YOUTUBE_API_BASE_URL}/search?` +
        `part=snippet&` +
        `q=${encodeURIComponent(searchQuery)}&` +
        `type=video&` +
        `maxResults=${maxResults}&` +
        `key=${YOUTUBE_API_KEY}`
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        return [];
      }

      return data.items.map(video => ({
        id: video.id.videoId,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.medium?.url,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${video.id.videoId}`,
        site: 'youtube'
      }));
    } catch (error) {
      console.error('Error fetching YouTube trailers:', error);
      return [];
    }
  }

  /**
   * Format AniList trailer or use YouTube as fallback
   * @param {Object} anilistTrailer - Trailer object from AniList
   * @param {string} title - Title for fallback search
   * @param {string} type - ANIME or MANGA
   * @returns {Promise<Object|null>} - Formatted trailer data
   */
  static async getTrailer(anilistTrailer, title, type = 'ANIME') {
    // If AniList has trailer data, use it
    if (anilistTrailer?.id && anilistTrailer?.site) {
      const site = anilistTrailer.site.toLowerCase();
      
      if (site === 'youtube') {
        return {
          id: anilistTrailer.id,
          title: anilistTrailer.title || `${title} Trailer`,
          thumbnail: anilistTrailer.thumbnail || `https://img.youtube.com/vi/${anilistTrailer.id}/maxresdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${anilistTrailer.id}`,
          embedUrl: `https://www.youtube.com/embed/${anilistTrailer.id}`,
          site: 'youtube',
          source: 'anilist'
        };
      } else if (site === 'dailymotion') {
        return {
          id: anilistTrailer.id,
          title: anilistTrailer.title || `${title} Trailer`,
          thumbnail: anilistTrailer.thumbnail || `https://www.dailymotion.com/thumbnail/video/${anilistTrailer.id}`,
          url: `https://www.dailymotion.com/video/${anilistTrailer.id}`,
          embedUrl: `https://www.dailymotion.com/embed/video/${anilistTrailer.id}`,
          site: 'dailymotion',
          source: 'anilist'
        };
      }
    }

    // Fallback to YouTube search
    console.log('No AniList trailer, searching YouTube for:', title);
    const youtubeTrailer = await this.searchTrailer(title, type);
    
    if (youtubeTrailer) {
      youtubeTrailer.source = 'youtube-search';
    }
    
    return youtubeTrailer;
  }
}

export default YouTubeService;
