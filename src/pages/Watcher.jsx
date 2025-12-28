import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';
import AnimeScraper from '../services/animeScraper';

const Watcher = () => {
  const { animeId, episodeId } = useParams();
  const navigate = useNavigate();
  const [streamUrl, setStreamUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpIndex, setCurrentEpIndex] = useState(-1);
  const [showControls, setShowControls] = useState(true);

  // Fetch Episode Stream
  useEffect(() => {
    const fetchStream = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = await AnimeScraper.getStreamSource(episodeId);
        if (url) {
          setStreamUrl(url);
        } else {
          setError('Failed to load video stream.');
        }
      } catch (err) {
        console.error('Error fetching stream:', err);
        setError('Error loading episode.');
      } finally {
        setLoading(false);
      }
    };

    if (episodeId) {
      fetchStream();
    }
  }, [episodeId]);

  // Fetch Episode List for Navigation
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (animeId) {
        const list = await AnimeScraper.getEpisodes(animeId);
        setEpisodes(list);
      }
    };
    fetchEpisodes();
  }, [animeId]);

  // Update current index
  useEffect(() => {
    if (episodes.length > 0 && episodeId) {
      const index = episodes.findIndex(ep => ep.id === episodeId);
      setCurrentEpIndex(index);
    }
  }, [episodes, episodeId]);

  const handleNext = () => {
    // Episodes are usually sorted Descending (Newest first) in the list we get
    // So "Next" episode (e.g. Ep 2 after Ep 1) is actually at index - 1 if sorted desc
    // But let's check the sort order. 
    // In AnimeScraper we sort Descending (b.number - a.number).
    // So Ep 10 is index 0, Ep 1 is index 9.
    // Next episode (Ep 2) is at index 8.
    if (currentEpIndex > 0) {
      const nextEp = episodes[currentEpIndex - 1];
      navigate(`/watch/${animeId}/${nextEp.id}`);
    }
  };

  const handlePrev = () => {
    if (currentEpIndex < episodes.length - 1) {
      const prevEp = episodes[currentEpIndex + 1];
      navigate(`/watch/${animeId}/${prevEp.id}`);
    }
  };

  // Auto-hide controls
  useEffect(() => {
    let timeout;
    if (showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls]);

  return (
    <div 
      className="min-h-screen bg-black flex flex-col relative"
      onMouseMove={() => setShowControls(true)}
      onClick={() => setShowControls(true)}
    >
      {/* Top Bar */}
      <div className={`fixed top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent p-4 z-50 transition-transform duration-300 ${showControls ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between text-white">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center space-x-2 hover:text-anime-cyan transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="font-medium">Back</span>
          </button>
          <div className="text-center">
            <h1 className="font-bold text-lg">
              {episodes[currentEpIndex] ? `Episode ${episodes[currentEpIndex].number}` : 'Loading...'}
            </h1>
          </div>
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </div>

      {/* Video Player */}
      <div className="flex-1 flex items-center justify-center bg-black w-full h-full">
        {loading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-anime-cyan"></div>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/10 rounded hover:bg-white/20 text-white"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="w-full h-full max-w-7xl mx-auto aspect-video relative">
            <iframe
              src={streamUrl}
              className="w-full h-full absolute inset-0 border-0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title="Anime Player"
            />
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className={`fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 z-50 transition-transform duration-300 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-center space-x-8 text-white">
          <button 
            onClick={handlePrev}
            disabled={currentEpIndex >= episodes.length - 1}
            className={`flex items-center space-x-2 px-6 py-3 rounded-full bg-white/10 hover:bg-anime-cyan/20 hover:text-anime-cyan transition-all ${currentEpIndex >= episodes.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="font-medium">Prev Episode</span>
          </button>

          <button 
            onClick={handleNext}
            disabled={currentEpIndex <= 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-full bg-white/10 hover:bg-anime-cyan/20 hover:text-anime-cyan transition-all ${currentEpIndex <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="font-medium">Next Episode</span>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Watcher;
