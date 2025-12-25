import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import MangaDexService from '../services/mangadex';
import { LoadingState } from '../utils/hooks';

const Reader = () => {
  const { mangaId, chapterId } = useParams();
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(-1);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  // Fetch chapter pages
  useEffect(() => {
    const fetchPages = async () => {
      setLoading(true);
      setError(null);
      try {
        const pageData = await MangaDexService.getChapterPages(chapterId);
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
  }, [chapterId]);

  // Fetch all chapters to enable navigation
  useEffect(() => {
    const fetchChapters = async () => {
      if (mangaId) {
        const chapterList = await MangaDexService.getChapters(mangaId);
        setChapters(chapterList);
      }
    };
    fetchChapters();
  }, [mangaId]);

  // Update current chapter index
  useEffect(() => {
    if (chapters.length > 0 && chapterId) {
      const index = chapters.findIndex(c => c.id === chapterId);
      setCurrentChapterIndex(index);
    }
  }, [chapters, chapterId]);

  const handleNextChapter = () => {
    if (currentChapterIndex > 0) { // Chapters are usually sorted desc (newest first)
      const nextChapter = chapters[currentChapterIndex - 1];
      navigate(`/read/${mangaId}/${nextChapter.id}`);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      const prevChapter = chapters[currentChapterIndex + 1];
      navigate(`/read/${mangaId}/${prevChapter.id}`);
      window.scrollTo(0, 0);
    }
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  // Auto-hide controls
  useEffect(() => {
    if (showControls) {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [showControls]);

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
    <div className="min-h-screen bg-black relative">
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
          </div>
          <button className="p-2 hover:bg-white/10 rounded-full">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Reader Content (Webtoon Mode - Vertical Scroll) */}
      <div 
        className="max-w-3xl mx-auto min-h-screen bg-black"
        onClick={toggleControls}
      >
        {pages.map((page, index) => (
          <img
            key={index}
            src={page.url}
            alt={`Page ${index + 1}`}
            className="w-full h-auto block"
            loading="lazy"
          />
        ))}
      </div>

      {/* Bottom Bar */}
      <div className={`fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md p-4 z-50 transition-transform duration-300 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between text-white">
          <button 
            onClick={handlePrevChapter}
            disabled={currentChapterIndex >= chapters.length - 1}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${currentChapterIndex >= chapters.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Prev</span>
          </button>
          
          <span className="text-sm text-gray-400">
            {currentChapterIndex !== -1 ? `${chapters.length - currentChapterIndex} / ${chapters.length}` : ''}
          </span>

          <button 
            onClick={handleNextChapter}
            disabled={currentChapterIndex <= 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${currentChapterIndex <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
          >
            <span>Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reader;
