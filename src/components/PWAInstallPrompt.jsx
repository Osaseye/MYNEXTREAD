import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Heart } from 'lucide-react';
import AniListService from '../services/anilist';
import logoImage from '/mynextread-app.png';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [animeImages, setAnimeImages] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      // Show our custom install prompt
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Fetch some trending anime images for the background
  useEffect(() => {
    const fetchAnimeImages = async () => {
      try {
        const response = await AniListService.getTrending('ANIME', 1, 6);
        const images = response.media
          .filter(anime => anime.coverImage?.large)
          .slice(0, 3)
          .map(anime => anime.coverImage.large);
        setAnimeImages(images);
      } catch (error) {
        console.log('Could not fetch anime images for PWA prompt');
      }
    };

    if (showInstallPrompt) {
      fetchAnimeImages();
    }
  }, [showInstallPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt so it can only be used once
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Hide for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already dismissed this session
  if (sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  if (!showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-slide-up">
      {/* Anime-themed PWA Install Card */}
      <div className="relative bg-black border border-anime-cyan/30 rounded-2xl shadow-anime-glow-cyan overflow-hidden">
        {/* Background anime images */}
        <div className="absolute inset-0 opacity-10">
          <div className="flex">
            {animeImages.map((image, index) => (
              <div 
                key={index} 
                className="flex-1 h-full"
                style={{
                  backgroundImage: `url(${image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'blur(1px) brightness(0.3)'
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="relative p-5">
          {/* Header with logo and close button */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src={logoImage} 
                  alt="MyNextRead" 
                  className="w-12 h-12 rounded-xl shadow-anime-glow-purple animate-bounce-in"
                />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-anime-cyan to-anime-purple rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-anime-text-primary text-lg">
                  My<span className="text-anime-cyan">Next</span>Read
                </h3>
                <p className="text-anime-text-muted text-xs">Install App</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-anime-text-muted hover:text-anime-cyan transition-colors p-1 rounded-lg hover:bg-anime-hover/30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Anime-themed description */}
          <div className="mb-4">
            <p className="text-anime-text-secondary text-sm mb-2 leading-relaxed">
              <span className="text-anime-pink">✨ Experience anime discovery like never before!</span>
            </p>
            <div className="flex items-center space-x-4 text-xs text-anime-text-muted">
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3 text-anime-pink" />
                <span>Offline reading</span>
              </div>
              <div className="flex items-center space-x-1">
                <Download className="w-3 h-3 text-anime-cyan" />
                <span>Faster access</span>
              </div>
            </div>
          </div>
          
          {/* Install buttons with anime styling */}
          <div className="flex space-x-3">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-to-r from-anime-cyan to-anime-purple text-black font-bold py-3 px-4 rounded-xl hover:shadow-anime-glow-cyan transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Install Now</span>
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-3 text-anime-text-secondary hover:text-anime-cyan transition-colors border border-anime-hover rounded-xl hover:border-anime-cyan"
            >
              Later
            </button>
          </div>
          
          {/* Anime accent line */}
          <div className="mt-4 flex justify-center">
            <div className="h-1 w-16 bg-gradient-to-r from-anime-cyan via-anime-purple to-anime-pink rounded-full opacity-60"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;