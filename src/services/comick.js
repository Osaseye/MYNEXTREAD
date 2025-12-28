// Comick API Service
// https://api.comick.io/

const COMICK_API_URL = 'https://api.comick.io';

class ComickService {
  /**
   * Helper to fetch with multiple proxy fallbacks
   */
  static async fetchWithFallbacks(url) {
    // 1. Try Direct
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
      if (response.status !== 403 && response.status !== 503 && response.status !== 522) {
         // If it's a real error (404, 500), don't retry proxies
         console.error(`[Comick] Direct error ${response.status}`);
         return null;
      }
      console.log(`[Comick] Direct access failed (${response.status}), trying proxies...`);
    } catch (e) {
      console.log('[Comick] Direct fetch failed, trying proxies...');
    }

    // 2. Try corsproxy.io
    try {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (response.ok) return await response.json();
      console.log(`[Comick] corsproxy.io failed (${response.status})`);
    } catch (e) {
      console.log('[Comick] corsproxy.io fetch failed');
    }

    // 3. Try allorigins (JSON wrapper)
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.contents) {
          return JSON.parse(data.contents);
        }
      }
      console.log(`[Comick] allorigins failed`);
    } catch (e) {
      console.log('[Comick] allorigins fetch failed');
    }

    return null;
  }

  /**
   * Search for manga on Comick
   * @param {string} title 
   */
  static async searchManga(title) {
    try {
      console.log(`[Comick] Searching for: ${title}`);
      const query = encodeURIComponent(title);
      const url = `${COMICK_API_URL}/v1.0/search?q=${query}&type=comic&limit=5`;
      
      const data = await this.fetchWithFallbacks(url);

      if (data && data.length > 0) {
        // Find the best match (usually the first one)
        const match = data[0];
        console.log(`[Comick] Found match: ${match.title} (${match.hid})`);
        return {
          id: match.hid,
          slug: match.slug,
          title: match.title,
          cover: match.md_covers ? match.md_covers[0].b2key : null
        };
      }
      console.log('[Comick] No matches found');
      return null;
    } catch (error) {
      console.error('Error searching Comick:', error);
      return null;
    }
  }

  /**
   * Get chapters for a manga
   * @param {string} comicHid - Comick HID
   */
  static async getChapters(comicHid) {
    try {
      let allChapters = [];
      let page = 1;
      let hasMore = true;
      const limit = 100; // Max limit usually

      console.log(`Starting Comick fetch for HID: ${comicHid}`);

      // Fetch chapters with pagination
      // We want English chapters (lang=en)
      while (hasMore) {
        const url = `${COMICK_API_URL}/comic/${comicHid}/chapters?lang=en&limit=${limit}&page=${page}`;
        const data = await this.fetchWithFallbacks(url);

        if (!data || !data.chapters || data.chapters.length === 0) {
          hasMore = false;
        } else {
          allChapters = [...allChapters, ...data.chapters];
          if (data.chapters.length < limit) {
            hasMore = false;
          } else {
            page++;
          }
        }
        
        // Safety break
        if (page > 20) hasMore = false; 
      }

      console.log(`Fetched ${allChapters.length} chapters from Comick`);

      // Map to unified format
      return allChapters.map(ch => ({
        id: ch.hid, // Chapter HID
        chapter: ch.chap,
        title: ch.title,
        volume: ch.vol,
        publishAt: ch.created_at,
        source: 'comick',
        // Comick specific
        group_name: ch.group_name && ch.group_name.length > 0 ? ch.group_name[0] : null
      }));

    } catch (error) {
      console.error('Error fetching Comick chapters:', error);
      return [];
    }
  }

  /**
   * Get pages for a chapter
   * @param {string} chapterHid 
   */
  static async getChapterPages(chapterHid) {
    try {
      const url = `${COMICK_API_URL}/chapter/${chapterHid}`;
      const data = await this.fetchWithFallbacks(url);

      if (data && data.chapter && data.chapter.md_images) {
        return data.chapter.md_images.map(img => ({
          url: `https://meo.comick.pictures/${img.b2key}`,
          filename: img.name
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching Comick pages:', error);
      return [];
    }
  }
}

export default ComickService;
