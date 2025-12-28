import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Settings, ChevronLeft, ChevronRight, X, Maximize, Minimize, AlignJustify, Columns } from 'lucide-react';
import MangaDexService from '../services/mangadex';
import ScraperService from '../services/scraper';
import ComickService from '../services/comick';
import { fetchAndMergeChapters } from '../utils/chapterMerging';

// Component for individual reader images with loading state
const ReaderImage = ({ src, alt, fitMode }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const getClassNames = () => {
    let base = "block transition-all duration-300 ";
    if (fitMode === 'width') return base + "w-full h-auto";
    if (fitMode === 'height') return base + "h-screen w-auto mx-auto object-contain";
    if (fitMode === 'original') return base + "max-w-none mx-auto";
    return base + "w-full h-auto";
  };

  return (
    <div className={`relative min-h-[50vh] flex items-center justify-center bg-black ${fitMode === 'height' ? 'h-screen' : ''}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-anime-cyan"></div>
        </div>
      )}
      {error ? (
        <div className="text-red-500 flex flex-col items-center p-4 z-20">
          <span>Failed to load image</span>
          <button 
            onClick={() => { setError(false); setLoaded(false); }}
            className="mt-2 px-3 py-1 bg-white/10 rounded text-sm hover:bg-white/20"
          >
            Retry
          </button>
        </div>
      ) : null}
      
      <img
        src={src}
        alt={alt}
        className={`${getClassNames()} ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
};

const Reader = () => {
  const { mangaId, chapterId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(-1);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [fitMode, setFitMode] = useState(() => localStorage.getItem('reader_fitMode') || 'width'); // width, height, original
  const [readingMode, setReadingMode] = useState(() => localStorage.getItem('reader_readingMode') || 'vertical'); // vertical, single
  const [currentPage, setCurrentPage] = useState(0); // For single page mode

  // Get source from query params
  const searchParams = new URLSearchParams(location.search);
  const source = searchParams.get('source') || 'mangadex';
  const title = searchParams.get('title');

  // Save settings
  useEffect(() => {
    localStorage.setItem('reader_fitMode', fitMode);
  }, [fitMode]);

  useEffect(() => {
    localStorage.setItem('reader_readingMode', readingMode);
  }, [readingMode]);

  // Reset page on chapter change
  useEffect(() => {
    setCurrentPage(0);
  }, [chapterId]);

  // Fetch chapter pages
  useEffect(() => {
    const fetchPages = async () => {
      setLoading(true);
      setError(null);
      try {
        let pageData = [];
        if (source === 'mangadex') {
          pageData = await MangaDexService.getChapterPages(chapterId);
        } else if (source === 'comick') {
          pageData = await ComickService.getChapterPages(chapterId);
        } else if (source === 'scraper') {
          // For scraper, chapterId is the full URL
          pageData = await ScraperService.getChapterPages(decodeURIComponent(chapterId));
        }
        setPages(pageData);
      } catch (err) {
        console.error('Error fetching pages:', err);
        setError('Failed to load chapter pages.');
      } finally {
        setLoading(false);
      }
    };

    if (chapterId) {
      fetchPages();
    }
  }, [chapterId, source]);

  // Fetch all chapters to enable navigation
  useEffect(() => {
    const fetchChapters = async () => {
      let chapterList = [];
      
      // If we have a title, use the unified fetcher to get the full mixed list
      if (title) {
        try {
          chapterList = await fetchAndMergeChapters(decodeURIComponent(title));
        } catch (e) {
          console.error('Error fetching unified chapters:', e);
        }
      } 
      // Fallback to single source if no title provided (legacy/direct link)
      else if (mangaId) {
        if (source === 'mangadex') {
          chapterList = await MangaDexService.getChapters(mangaId);
          // Normalize for navigation
          chapterList = chapterList.map(c => ({...c, source: 'mangadex', mangaId}));
        } else if (source === 'comick') {
          chapterList = await ComickService.getChapters(mangaId);
          chapterList = chapterList.map(c => ({...c, source: 'comick', mangaId}));
        } else if (source === 'scraper') {
          chapterList = await ScraperService.getChapters(decodeURIComponent(mangaId));
          // Normalize for navigation
          chapterList = chapterList.map(c => ({...c, source: 'scraper', mangaId: decodeURIComponent(mangaId)}));
        }
      }
      setChapters(chapterList);
    };
    fetchChapters();
  }, [mangaId, source, title]);

  // Update current chapter index
  useEffect(() => {
    if (chapters.length > 0 && chapterId) {
      const decodedChapterId = decodeURIComponent(chapterId);
      const index = chapters.findIndex(c => c.id === decodedChapterId || c.id === chapterId);
      setCurrentChapterIndex(index);
    }
  }, [chapters, chapterId]);

  const handleNextChapter = () => {
    if (currentChapterIndex > 0) { // Chapters are usually sorted desc (newest first) 
      const nextChapter = chapters[currentChapterIndex - 1];
      const nextSource = nextChapter.source || source;
      const nextMangaId = nextChapter.mangaId || mangaId;
      const nextTitleParam = title ? `&title=${encodeURIComponent(title)}` : '';
      
      navigate(`/read/${encodeURIComponent(nextMangaId)}/${encodeURIComponent(nextChapter.id)}?source=${nextSource}${nextTitleParam}`);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      const prevChapter = chapters[currentChapterIndex + 1];
      const prevSource = prevChapter.source || source;
      const prevMangaId = prevChapter.mangaId || mangaId;
      const prevTitleParam = title ? `&title=${encodeURIComponent(title)}` : '';

      navigate(`/read/${encodeURIComponent(prevMangaId)}/${encodeURIComponent(prevChapter.id)}?source=${prevSource}${prevTitleParam}`);
      window.scrollTo(0, 0);
    }
  };

  const handleSinglePageNav = (direction) => {
    if (direction === 'next') {
      if (currentPage < pages.length - 1) {
        setCurrentPage(prev => prev + 1);
        window.scrollTo(0, 0);
      } else {
        handleNextChapter();
      }
    } else {
      if (currentPage > 0) {
        setCurrentPage(prev => prev - 1);
        window.scrollTo(0, 0);
      } else {
        handlePrevChapter();
      }
    }
  };

  const toggleControls = (e) => {
    // Don't toggle if clicking on settings modal or buttons
    if (e.target.closest('button') || e.target.closest('.settings-modal')) return;
    setShowControls(!showControls);
  };

  // Auto-hide controls
  useEffect(() => {
    if (showControls && !showSettings) {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [showControls, showSettings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-anime-cyan"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-anime-hover rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Top Bar */}
      <div className={`fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md p-4 z-50 transition-transform duration-300 ${showControls ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between text-white">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h1 className="font-bold truncate max-w-[200px] md:max-w-md">
              {chapters[currentChapterIndex]?.chapter ? `Chapter ${chapters[currentChapterIndex].chapter}` : 'Chapter'}
            </h1>
            {readingMode === 'single' && (
              <p className="text-xs text-gray-400">Page {currentPage + 1} / {pages.length}</p>
            )}
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-anime-cyan text-black' : 'hover:bg-white/10'}`}
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed top-20 right-4 z-50 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-4 settings-modal text-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Reader Settings</h3>
            <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-white/10 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 uppercase font-semibold mb-2 block">Reading Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setReadingMode('vertical')}
                  className={`flex flex-col items-center p-2 rounded-lg border ${readingMode === 'vertical' ? 'border-anime-cyan bg-anime-cyan/10 text-anime-cyan' : 'border-gray-700 hover:bg-white/5'}`}
                >
                  <AlignJustify className="w-6 h-6 mb-1" />
                  <span className="text-xs">Vertical</span>
                </button>
                <button 
                  onClick={() => setReadingMode('single')}
                  className={`flex flex-col items-center p-2 rounded-lg border ${readingMode === 'single' ? 'border-anime-cyan bg-anime-cyan/10 text-anime-cyan' : 'border-gray-700 hover:bg-white/5'}`}
                >
                  <Columns className="w-6 h-6 mb-1" />
                  <span className="text-xs">Single Page</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 uppercase font-semibold mb-2 block">Image Fit</label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setFitMode('width')}
                  className={`flex flex-col items-center p-2 rounded-lg border ${fitMode === 'width' ? 'border-anime-cyan bg-anime-cyan/10 text-anime-cyan' : 'border-gray-700 hover:bg-white/5'}`}
                >
                  <Maximize className="w-5 h-5 mb-1 rotate-90" />
                  <span className="text-[10px]">Width</span>
                </button>
                <button 
                  onClick={() => setFitMode('height')}
                  className={`flex flex-col items-center p-2 rounded-lg border ${fitMode === 'height' ? 'border-anime-cyan bg-anime-cyan/10 text-anime-cyan' : 'border-gray-700 hover:bg-white/5'}`}
                >
                  <Maximize className="w-5 h-5 mb-1" />
                  <span className="text-[10px]">Height</span>
                </button>
                <button 
                  onClick={() => setFitMode('original')}
                  className={`flex flex-col items-center p-2 rounded-lg border ${fitMode === 'original' ? 'border-anime-cyan bg-anime-cyan/10 text-anime-cyan' : 'border-gray-700 hover:bg-white/5'}`}
                >
                  <Minimize className="w-5 h-5 mb-1" />
                  <span className="text-[10px]">Original</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reader Content */}
      <div 
        className={`min-h-screen bg-black ${readingMode === 'vertical' ? 'max-w-3xl mx-auto' : 'flex items-center justify-center h-screen'}`}
        onClick={toggleControls}
      >
        {readingMode === 'vertical' ? (
          // Vertical Mode
          <div className="flex flex-col">
            {pages.map((page, index) => (
              <ReaderImage 
                key={index} 
                src={page.url} 
                alt={`Page ${index + 1}`} 
                fitMode={fitMode} 
              />
            ))}
          </div>
        ) : (
          // Single Page Mode
          <div className="w-full h-full flex items-center justify-center relative">
            {/* Click Zones for Navigation */}
            <div 
              className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); handleSinglePageNav('prev'); }}
            />
            <div 
              className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); handleSinglePageNav('next'); }}
            />
            
            {pages[currentPage] && (
              <ReaderImage 
                src={pages[currentPage].url} 
                alt={`Page ${currentPage + 1}`} 
                fitMode={fitMode} 
              />
            )}
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className={`fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md p-4 z-50 transition-transform duration-300 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between text-white">
          <button 
            onClick={readingMode === 'single' ? () => handleSinglePageNav('prev') : handlePrevChapter}
            disabled={readingMode === 'single' ? (currentPage === 0 && currentChapterIndex >= chapters.length - 1) : (currentChapterIndex >= chapters.length - 1)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>{readingMode === 'single' ? 'Prev' : 'Prev Chapter'}</span>
          </button>
          
          <span className="text-sm text-gray-400">
            {readingMode === 'single' 
              ? `${currentPage + 1} / ${pages.length}`
              : (currentChapterIndex !== -1 ? `${chapters.length - currentChapterIndex} / ${chapters.length}` : '')
            }
          </span>

          <button 
            onClick={readingMode === 'single' ? () => handleSinglePageNav('next') : handleNextChapter}
            disabled={readingMode === 'single' ? (currentPage === pages.length - 1 && currentChapterIndex <= 0) : (currentChapterIndex <= 0)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span>{readingMode === 'single' ? 'Next' : 'Next Chapter'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reader;
