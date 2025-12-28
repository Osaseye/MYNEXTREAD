// Anime Scraper Service for fetching episodes from GogoAnime (Anitaku)
// Uses a CORS proxy to bypass browser restrictions

const PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://thingproxy.freeboard.io/fetch/'
];

const BASE_URL = 'https://anitaku.to'; // GogoAnime domain
const AJAX_URL = 'https://ajax.gogocdn.net/ajax';

class AnimeScraper {
  /**
   * Helper to fetch text content via proxy with fallbacks
   */
  static async fetchText(url) {
    for (const proxy of PROXIES) {
      try {
        console.log(`AnimeScraper: Trying proxy ${proxy}`);
        const response = await fetch(`${proxy}${encodeURIComponent(url)}`);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = await response.text();
        
        // Basic validation to check if we got a valid HTML response or an error page
        if (data.includes('404 Not Found') || data.includes('Oops... Request failed') || data.includes('Just a moment...')) {
          throw new Error('Proxy returned error page');
        }
        
        return data;
      } catch (error) {
        console.warn(`Proxy ${proxy} failed:`, error);
        // Continue to next proxy
      }
    }
    console.error('All proxies failed');
    return null;
  }

  /**
   * Search for anime
   * @param {string} title 
   */
  static async searchAnime(title) {
    try {
      const searchSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      // Try direct slug match first (often works for exact titles)
      // But search is safer
      const searchUrl = `${BASE_URL}/search.html?keyword=${encodeURIComponent(title)}`;
      
      console.log('AnimeScraper: Searching for', searchUrl);
      const html = await this.fetchText(searchUrl);
      
      if (!html) return null;

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Find first result
      const firstResult = doc.querySelector('.last_episodes .items li .name a');
      
      if (firstResult) {
        const href = firstResult.getAttribute('href'); // /category/slug
        const slug = href.split('/').pop();
        console.log('AnimeScraper: Found match', slug);
        return {
          id: slug,
          title: firstResult.getAttribute('title'),
          url: `${BASE_URL}${href}`
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error searching anime:', error);
      return null;
    }
  }

  /**
   * Get episodes for an anime
   * @param {string} slug - The category slug (e.g., 'naruto')
   */
  static async getEpisodes(slug) {
    try {
      const url = `${BASE_URL}/category/${slug}`;
      console.log('AnimeScraper: Fetching details from', url);
      const html = await this.fetchText(url);
      
      if (!html) return [];

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Debug: Check if we got the right page
      console.log('AnimeScraper: Page title:', doc.title);

      // Extract Anime ID for AJAX call
      let animeId;
      
      // 1. Try ID selector
      const idInput = doc.querySelector('input#movie_id');
      if (idInput) {
        animeId = idInput.value;
      } 
      
      // 2. Try Class selector
      if (!animeId) {
         const idInputByClass = doc.querySelector('.movie_id');
         if (idInputByClass) {
             animeId = idInputByClass.value;
         }
      }

      // 3. Try Name selector
      if (!animeId) {
         const idInputByName = doc.querySelector('input[name="movie_id"]');
         if (idInputByName) {
             animeId = idInputByName.value;
         }
      }

      // 4. Try Regex for input tag
      if (!animeId) {
         const idMatch = html.match(/<input[^>]*id="movie_id"[^>]*value="(\d+)"/i) || 
                         html.match(/<input[^>]*value="(\d+)"[^>]*id="movie_id"/i);
         if (idMatch) {
             animeId = idMatch[1];
         }
      }

      // 5. Try Regex for JS variable
      if (!animeId) {
          const jsMatch = html.match(/movie_id\s*=\s*['"](\d+)['"]/i);
          if (jsMatch) {
              animeId = jsMatch[1];
          }
      }

      // 6. Fallback: Try to fetch Episode 1 to find the ID there
      if (!animeId) {
          console.log('AnimeScraper: ID not found on category page, trying Episode 1...');
          try {
              const ep1Url = `${BASE_URL}/${slug}-episode-1`;
              const ep1Html = await this.fetchText(ep1Url);
              if (ep1Html) {
                  const ep1Match = ep1Html.match(/<input[^>]*value="(\d+)"[^>]*id="movie_id"/i) || 
                                   ep1Html.match(/movie_id\s*=\s*['"](\d+)['"]/i);
                  if (ep1Match) {
                      animeId = ep1Match[1];
                      console.log('AnimeScraper: Found ID on Episode 1 page:', animeId);
                  }
              }
          } catch (e) {
              console.warn('AnimeScraper: Failed to fetch Episode 1 fallback', e);
          }
      }

      // 7. Fallback: Try using the alias (slug) directly if ID is missing
      let ajaxUrl;
      if (animeId) {
          ajaxUrl = `${AJAX_URL}/load-list-episode?ep_start=0&ep_end=2000&id=${animeId}`;
      } else {
          console.warn('AnimeScraper: ID not found, trying fallback with alias/slug:', slug);
          ajaxUrl = `${AJAX_URL}/load-list-episode?ep_start=0&ep_end=2000&alias=${slug}`;
      }

      console.log('AnimeScraper: Fetching episodes AJAX', ajaxUrl);
      
      const episodeHtml = await this.fetchText(ajaxUrl);
      if (!episodeHtml) return [];

      const epDoc = parser.parseFromString(episodeHtml, 'text/html');
      const items = epDoc.querySelectorAll('li a');
      
      const episodes = Array.from(items).map(item => {
        const href = item.getAttribute('href').trim(); // /naruto-episode-1
        const epNum = item.querySelector('.name').textContent.replace('EP ', '').trim();
        return {
          id: href.replace(/^\//, ''), // naruto-episode-1
          number: epNum,
          url: `${BASE_URL}${href}`
        };
      });

      // GogoAnime usually returns newest first or oldest first depending on the show, 
      // but the list is often reversed in the UI. 
      // We'll sort by number to be safe.
      return episodes.sort((a, b) => parseFloat(b.number) - parseFloat(a.number)); // Descending
    } catch (error) {
      console.error('Error fetching episodes:', error);
      return [];
    }
  }

  /**
   * Get stream URL (iframe) for an episode
   * @param {string} episodeId - The episode slug (e.g., 'naruto-episode-1')
   */
  static async getStreamSource(episodeId) {
    try {
      const url = `${BASE_URL}/${episodeId}`;
      console.log('AnimeScraper: Fetching stream from', url);
      const html = await this.fetchText(url);
      
      if (!html) return null;

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Find the iframe
      // Usually in .play-video iframe
      const iframe = doc.querySelector('iframe');
      if (iframe) {
        return iframe.src;
      }
      
      // Fallback: Look for .anime_muti_link
      const serverLinks = doc.querySelectorAll('.anime_muti_link a');
      if (serverLinks.length > 0) {
        // Return the first server's data-video
        return serverLinks[0].getAttribute('data-video');
      }

      return null;
    } catch (error) {
      console.error('Error fetching stream:', error);
      return null;
    }
  }
}

export default AnimeScraper;
