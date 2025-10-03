// Platform mapping and links utility
import crunchyrollLogo from '../assets/Platform-logo/crunchyroll.jpg';
import funimationLogo from '../assets/Platform-logo/Funimation.jpg';
import mangadexLogo from '../assets/Platform-logo/MangaDex.jpg';
import netflixLogo from '../assets/Platform-logo/Netflix.jpg';
import novelupdatesLogo from '../assets/Platform-logo/novelupdates.jpg';
import webtoonLogo from '../assets/Platform-logo/WEBTOON.jpg';

// Platform configurations
export const PLATFORMS = {
  // Anime platforms
  CRUNCHYROLL: {
    name: 'Crunchyroll',
    logo: crunchyrollLogo,
    baseUrl: 'https://www.crunchyroll.com',
    searchUrl: 'https://www.crunchyroll.com/search?q=',
    type: 'anime'
  },
  FUNIMATION: {
    name: 'Funimation',
    logo: funimationLogo,
    baseUrl: 'https://www.funimation.com',
    searchUrl: 'https://www.funimation.com/search/?q=',
    type: 'anime'
  },
  NETFLIX: {
    name: 'Netflix',
    logo: netflixLogo,
    baseUrl: 'https://www.netflix.com',
    searchUrl: 'https://www.netflix.com/search?q=',
    type: 'both'
  },
  ANIMEPAHE: {
    name: 'AnimePahe',
    logo: null,
    baseUrl: 'https://animepahe.com',
    searchUrl: 'https://animepahe.com/search?query=',
    type: 'anime'
  },
  NINEANIME: {
    name: '9anime',
    logo: null,
    baseUrl: 'https://9anime.to',
    searchUrl: 'https://9anime.to/search?keyword=',
    type: 'anime'
  },
  GOGOANIME: {
    name: 'GogoAnime',
    logo: null,
    baseUrl: 'https://gogoanime.pe',
    searchUrl: 'https://gogoanime.pe/search.html?keyword=',
    type: 'anime'
  },
  ANIWATCH: {
    name: 'AniWatch',
    logo: null,
    baseUrl: 'https://aniwatch.to',
    searchUrl: 'https://aniwatch.to/search?keyword=',
    type: 'anime'
  },
  
  // Manga platforms
  MANGADEX: {
    name: 'MangaDex',
    logo: mangadexLogo,
    baseUrl: 'https://mangadex.org',
    searchUrl: 'https://mangadex.org/search?q=',
    type: 'manga'
  },
  WEBTOON: {
    name: 'WEBTOON',
    logo: webtoonLogo,
    baseUrl: 'https://www.webtoons.com',
    searchUrl: 'https://www.webtoons.com/en/search?keyword=',
    type: 'manga'
  },
  NOVEL_UPDATES: {
    name: 'Novel Updates',
    logo: novelupdatesLogo,
    baseUrl: 'https://www.novelupdates.com',
    searchUrl: 'https://www.novelupdates.com/?s=',
    type: 'novel'
  },
  MANGAKAKALOT: {
    name: 'MangaKakalot',
    logo: null,
    baseUrl: 'https://mangakakalot.com',
    searchUrl: 'https://mangakakalot.com/search/story/',
    type: 'manga'
  },
  MANGANELO: {
    name: 'Manganelo',
    logo: null,
    baseUrl: 'https://m.manganelo.com',
    searchUrl: 'https://m.manganelo.com/search/story/',
    type: 'manga'
  },
  MANGAREADER: {
    name: 'MangaReader',
    logo: null,
    baseUrl: 'https://mangareader.to',
    searchUrl: 'https://mangareader.to/search?keyword=',
    type: 'manga'
  },
  WEBNOVEL: {
    name: 'WebNovel',
    logo: null,
    baseUrl: 'https://www.webnovel.com',
    searchUrl: 'https://www.webnovel.com/search?keywords=',
    type: 'novel'
  },
  LIGHTNOVELPUB: {
    name: 'LightNovelPub',
    logo: null,
    baseUrl: 'https://www.lightnovelpub.com',
    searchUrl: 'https://www.lightnovelpub.com/search?q=',
    type: 'novel'
  }
};

// Get platforms based on media type
export const getPlatformsForMedia = (format) => {
  const isAnime = ['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL'].includes(format);
  const isManga = ['MANGA', 'ONE_SHOT'].includes(format);
  const isNovel = ['NOVEL'].includes(format);

  let platforms = [];

  if (isAnime) {
    platforms = [
      PLATFORMS.CRUNCHYROLL,
      PLATFORMS.NETFLIX,
      PLATFORMS.ANIMEPAHE,
      PLATFORMS.NINEANIME,
      PLATFORMS.GOGOANIME,
      PLATFORMS.ANIWATCH
    ];
  } else if (isManga) {
    platforms = [
      PLATFORMS.MANGADEX,
      PLATFORMS.WEBTOON,
      PLATFORMS.MANGAKAKALOT,
      PLATFORMS.MANGANELO,
      PLATFORMS.MANGAREADER
    ];
  } else if (isNovel) {
    platforms = [
      PLATFORMS.NOVEL_UPDATES,
      PLATFORMS.WEBNOVEL,
      PLATFORMS.LIGHTNOVELPUB
    ];
  } else {
    // Default fallback - show a mix
    platforms = [
      PLATFORMS.CRUNCHYROLL,
      PLATFORMS.MANGADEX,
      PLATFORMS.NOVEL_UPDATES,
      PLATFORMS.NETFLIX
    ];
  }

  return platforms;
};

// Generate search URL for a platform
export const getSearchUrl = (platform, title) => {
  return platform.searchUrl + encodeURIComponent(title);
};