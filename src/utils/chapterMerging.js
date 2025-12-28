import MangaDexService from '../services/mangadex';
import ScraperService from '../services/scraper';
import ComickService from '../services/comick';

/**
 * Fetches chapters from multiple sources and merges them.
 * Prioritizes MangaDex, then Comick, then Scraper (Manganato).
 * 
 * @param {string} title - The title of the manga to search for
 * @returns {Promise<Array>} - Unified list of chapters
 */
export const fetchAndMergeChapters = async (title) => {
  console.log(`[ChapterMerging] Starting search for: ${title}`);
  
  // 1. Search all services in parallel
  const [mangadexManga, comickManga, scraperManga] = await Promise.all([
    MangaDexService.searchManga(title).catch(e => {
      console.error('MangaDex search failed:', e);
      return null;
    }),
    ComickService.searchManga(title).catch(e => {
      console.error('Comick search failed:', e);
      return null;
    }),
    ScraperService.searchManga(title).catch(e => {
      console.error('Scraper search failed:', e);
      return null;
    })
  ]);

  // 2. Fetch chapters from found services in parallel
  const promises = [];
  
  if (mangadexManga) {
    console.log(`[ChapterMerging] Found on MangaDex: ${mangadexManga.id}`);
    promises.push(
      MangaDexService.getChapters(mangadexManga.id, 2000)
        .then(chapters => ({ source: 'mangadex', mangaId: mangadexManga.id, chapters }))
        .catch(e => {
          console.error('MangaDex chapters failed:', e);
          return { source: 'mangadex', chapters: [] };
        })
    );
  } else {
    promises.push(Promise.resolve({ source: 'mangadex', chapters: [] }));
  }

  if (comickManga) {
    console.log(`[ChapterMerging] Found on Comick: ${comickManga.id}`);
    promises.push(
      ComickService.getChapters(comickManga.id)
        .then(chapters => ({ source: 'comick', mangaId: comickManga.id, chapters }))
        .catch(e => {
          console.error('Comick chapters failed:', e);
          return { source: 'comick', chapters: [] };
        })
    );
  } else {
    promises.push(Promise.resolve({ source: 'comick', chapters: [] }));
  }

  if (scraperManga) {
    console.log(`[ChapterMerging] Found on Scraper: ${scraperManga.url}`);
    promises.push(
      ScraperService.getChapters(scraperManga.url)
        .then(chapters => ({ source: 'scraper', mangaId: scraperManga.url, chapters }))
        .catch(e => {
          console.error('Scraper chapters failed:', e);
          return { source: 'scraper', chapters: [] };
        })
    );
  } else {
    promises.push(Promise.resolve({ source: 'scraper', chapters: [] }));
  }

  const results = await Promise.all(promises);
  
  const mangadexResult = results.find(r => r.source === 'mangadex');
  const comickResult = results.find(r => r.source === 'comick');
  const scraperResult = results.find(r => r.source === 'scraper');

  // 3. Merge Logic
  const mergedChapters = new Map();

  // Helper to parse chapter number safely
  const parseChapterNum = (numStr) => {
    const num = parseFloat(numStr);
    return isNaN(num) ? -1 : num;
  };

  // Process MangaDex first (Priority 1)
  if (mangadexResult && mangadexResult.chapters) {
    mangadexResult.chapters.forEach(ch => {
      const num = parseChapterNum(ch.chapter);
      if (num >= 0) {
        mergedChapters.set(num, {
          ...ch,
          source: 'mangadex',
          mangaId: mangadexResult.mangaId,
          id: ch.id
        });
      }
    });
  }

  // Process Comick (Priority 2 - Fill gaps)
  if (comickResult && comickResult.chapters) {
    comickResult.chapters.forEach(ch => {
      const num = parseChapterNum(ch.chapter);
      if (num >= 0) {
        if (!mergedChapters.has(num)) {
          mergedChapters.set(num, {
            ...ch,
            source: 'comick',
            mangaId: comickResult.mangaId,
            id: ch.id,
            scanlation_group: { attributes: { name: ch.group_name } } // Normalize group name
          });
        }
      }
    });
  }

  // Process Scraper (Priority 3 - Fill remaining gaps)
  if (scraperResult && scraperResult.chapters) {
    scraperResult.chapters.forEach(ch => {
      const num = parseChapterNum(ch.chapter);
      if (num >= 0) {
        if (!mergedChapters.has(num)) {
          mergedChapters.set(num, {
            ...ch,
            source: 'scraper',
            mangaId: scraperResult.mangaId,
            publishAt: null,
            scanlation_group: null
          });
        }
      }
    });
  }

  // Convert to array and sort
  const sortedChapters = Array.from(mergedChapters.values()).sort((a, b) => {
    const numA = parseChapterNum(a.chapter);
    const numB = parseChapterNum(b.chapter);
    return numB - numA; // Descending order (newest first)
  });

  console.log(`[ChapterMerging] Merged total: ${sortedChapters.length} chapters.`);
  return sortedChapters;
};

