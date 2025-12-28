// MangaDex API Service
// Handles mapping AniList titles to MangaDex and fetching chapters/pages

const MANGADEX_API_URL = 'https://api.mangadex.org';
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/'; // Fallback if needed, but MangaDex usually supports CORS

class MangaDexService {
  /**
   * Search for a manga on MangaDex by title to find its ID
   * @param {string} title - Manga title
   * @returns {Promise<Object|null>} - MangaDex manga object
   */
  static async searchManga(title) {
    try {
      const params = new URLSearchParams({
        title: title,
        limit: 5,
        'order[relevance]': 'desc',
        'includes[]': 'cover_art'
      });

      const response = await fetch(`${MANGADEX_API_URL}/manga?${params}`);
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        // Return the first match
        return data.data[0];
      }
      return null;
    } catch (error) {
      console.error('Error searching MangaDex:', error);
      return null;
    }
  }

  /**
   * Get chapters for a manga
   * @param {string} mangaId - MangaDex ID
   * @param {number} limit - Number of chapters to fetch
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} - List of chapters
   */
  static async getChapters(mangaId, limit = 500, offset = 0) {
    try {
      let allRawChapters = [];
      let hasMore = true;
      let currentOffset = offset;
      const batchSize = 100; // MangaDex max limit per request

      console.log(`Starting MangaDex fetch for ID: ${mangaId}`);

      while (hasMore && allRawChapters.length < limit) {
        const url = new URL(`${MANGADEX_API_URL}/chapter`);
        url.searchParams.append('limit', batchSize);
        url.searchParams.append('offset', currentOffset);
        url.searchParams.append('manga', mangaId);
        url.searchParams.append('translatedLanguage[]', 'en');
        url.searchParams.append('order[chapter]', 'desc');
        url.searchParams.append('includes[]', 'scanlation_group');
        
        // Add content ratings explicitly
        ['safe', 'suggestive', 'erotica', 'pornographic'].forEach(rating => {
          url.searchParams.append('contentRating[]', rating);
        });

        console.log(`Fetching MangaDex batch (offset ${currentOffset})...`);
        const response = await fetch(url.toString());
        
        if (!response.ok) {
          console.error(`MangaDex API Error: ${response.status} ${response.statusText}`);
          break;
        }

        let data;
        try {
          data = await response.json();
        } catch (e) {
          console.error('MangaDex API returned non-JSON response:', e);
          break;
        }

        const batch = data.data || [];
        const total = data.total || 0;

        allRawChapters = [...allRawChapters, ...batch];
        currentOffset += batchSize;

        console.log(`Fetched ${batch.length} items. Total so far: ${allRawChapters.length}/${total}`);

        // Stop if we've reached the total available or received no data
        if (currentOffset >= total || batch.length === 0) {
          hasMore = false;
        }
        
        // Small delay to be nice to the API
        if (hasMore) await new Promise(r => setTimeout(r, 200));
      }

      if (allRawChapters.length > 0) {
        // Filter out duplicates (sometimes multiple groups translate the same chapter)
        // We'll prefer the one with the most recent publish date or just take the first one found
        const uniqueChapters = [];
        const seenChapters = new Set();

        // Sort by chapter number descending before filtering to ensure we get the latest versions if duplicates exist
        // (Though the API sort should handle this, it's good to be safe)
        
        allRawChapters.forEach(chapter => {
          const chapterNum = chapter.attributes.chapter;
          // If chapter number is null (oneshot) or we haven't seen this chapter number yet
          if (!chapterNum || !seenChapters.has(chapterNum)) {
            if (chapterNum) seenChapters.add(chapterNum);
            
            uniqueChapters.push({
              id: chapter.id,
              chapter: chapter.attributes.chapter,
              title: chapter.attributes.title,
              volume: chapter.attributes.volume,
              publishAt: chapter.attributes.publishAt,
              pages: chapter.attributes.pages,
              scanlation_group: chapter.relationships.find(r => r.type === 'scanlation_group')
            });
          }
        });

        console.log('Unique chapters found after deduplication:', uniqueChapters.length);
        return uniqueChapters;
      }
      return [];
    } catch (error) {
      console.error('Error fetching chapters:', error);
      return [];
    }
  }

  /**
   * Get pages for a specific chapter
   * @param {string} chapterId - MangaDex Chapter ID
   * @returns {Promise<Array>} - Array of image URLs
   */
  static async getChapterPages(chapterId) {
    try {
      // 1. Get chapter metadata to find the hash and filenames
      const response = await fetch(`${MANGADEX_API_URL}/at-home/server/${chapterId}`);
      const data = await response.json();

      if (data.baseUrl) {
        const { baseUrl, chapter } = data;
        const { hash, data: files } = chapter;

        // Construct image URLs
        // Format: {baseUrl}/data/{hash}/{filename}
        return files.map(filename => ({
          url: `${baseUrl}/data/${hash}/${filename}`,
          filename: filename
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching chapter pages:', error);
      return [];
    }
  }
}

export default MangaDexService;
