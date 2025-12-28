// Scraper Service for fetching manga from aggregators (Manganato/Mangakakalot)
// Uses a CORS proxy to bypass browser restrictions

// Using allorigins JSON API to avoid direct redirects/spam
const CORS_PROXY = 'https://api.allorigins.win/get?url=';
const BASE_URL = 'https://manganato.com';

class ScraperService {
  /**
   * Helper to fetch text content via proxy
   */
  static async fetchText(url) {
    try {
      const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
      const data = await response.json();
      return data.contents;
    } catch (error) {
      console.error('Proxy fetch failed:', error);
      return null;
    }
  }

  /**
   * Search for manga on Manganato
   * @param {string} title 
   */
  static async searchManga(title) {
    try {
      // Format title for search: https://manganato.com/search/story/one_piece
      const searchSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const searchUrl = `${BASE_URL}/search/story/${searchSlug}`;
      
      console.log('Scraper: Searching for', searchUrl);
      const html = await this.fetchText(searchUrl);
      
      if (!html || html.length < 100) {
        console.log('Scraper: No contents returned from proxy');
        return null;
      }

      // Parse HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Debug: Log page title
      console.log('Scraper: Page Title:', doc.title);
      
      // Check for spam/bad proxy response
      if (doc.title.includes('Spin The Wheel') || doc.title.includes('Error') || doc.title.includes('403')) {
         console.error('Scraper: Proxy returned spam or error page');
         return null;
      }

      // Get first result
      const firstResult = doc.querySelector('.search-story-item a.item-title');
      
      if (firstResult) {
        console.log('Scraper: Found match', firstResult.textContent);
        return {
          id: firstResult.href.split('/').pop(), // Extract ID from URL
          title: firstResult.textContent,
          url: firstResult.href
        };
      }
      
      // Try alternative selector (Mangakakalot style)
      const altResult = doc.querySelector('.story_item h3 a');
      if (altResult) {
         console.log('Scraper: Found match (alt selector)', altResult.textContent);
         return {
          id: altResult.href.split('/').pop(),
          title: altResult.textContent,
          url: altResult.href
        };
      }

      console.log('Scraper: No match found in HTML.');
      return null;
    } catch (error) {
      console.error('Error searching Manganato:', error);
      return null;
    }
  }

  /**
   * Get chapters from Manganato
   * @param {string} mangaUrl - Full URL to the manga page
   */
  static async getChapters(mangaUrl) {
    try {
      console.log('Scraper: Fetching chapters from', mangaUrl);
      const html = await this.fetchText(mangaUrl);
      
      if (!html) {
        console.log('Scraper: No contents for chapters');
        return [];
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Check for spam/bad proxy response
      if (doc.title.includes('Spin The Wheel') || doc.title.includes('Error')) {
         console.error('Scraper: Proxy returned spam or error page');
         return [];
      }
      
      const chapterElements = doc.querySelectorAll('.row-content-chapter li a.chapter-name');
      console.log(`Scraper: Found ${chapterElements.length} chapters`);
      
      return Array.from(chapterElements).map(el => ({
        id: el.href.split('/').pop(), // chapter-123
        chapter: el.textContent.match(/Chapter\s+(\d+(\.\d+)?)/)?.[1] || '0',
        title: el.textContent,
        url: el.href,
        source: 'scraper'
      }));
    } catch (error) {
      console.error('Error fetching Manganato chapters:', error);
      return [];
    }
  }

  /**
   * Get pages for a chapter
   * @param {string} chapterUrl 
   */
  static async getChapterPages(chapterUrl) {
    try {
      const html = await this.fetchText(chapterUrl);
      
      if (!html) return [];

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Check for spam/bad proxy response
      if (doc.title.includes('Spin The Wheel') || doc.title.includes('Error')) {
         console.error('Scraper: Proxy returned spam or error page');
         return [];
      }
      
      const images = doc.querySelectorAll('.container-chapter-reader img');
      
      return Array.from(images).map(img => ({
        url: img.src, // Note: These images might need a referrer to load
        filename: img.src.split('/').pop()
      }));
    } catch (error) {
      console.error('Error fetching Manganato pages:', error);
      return [];
    }
  }
}

export default ScraperService;
