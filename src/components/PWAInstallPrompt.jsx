import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if app is running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      // Show install prompt after a delay
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Clean up
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

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
    
    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't show if already installed, dismissed, or no prompt available
  if (isStandalone || 
      sessionStorage.getItem('installPromptDismissed') || 
      (!showInstallPrompt && !isIOS)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-anime-card/95 backdrop-blur-sm border border-anime-hover rounded-2xl p-4 shadow-anime-glow-cyan">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-anime-cyan to-anime-purple rounded-xl flex items-center justify-center">
              <Download className="w-5 h-5 text-anime-dark" />
            </div>
            <div>
              <h3 className="text-anime-text-primary font-bold text-sm">Install MyNextRead</h3>
              <p className="text-anime-text-secondary text-xs">Get the full app experience</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-anime-text-secondary hover:text-anime-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isIOS ? (
          <div className="space-y-2">
            <p className="text-anime-text-secondary text-xs">
              To install this app on your iPhone/iPad:
            </p>
            <ol className="text-anime-text-secondary text-xs space-y-1 ml-4">
              <li>1. Tap the Share button in Safari</li>
              <li>2. Select "Add to Home Screen"</li>
              <li>3. Tap "Add" to install</li>
            </ol>
          </div>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-to-r from-anime-cyan to-anime-purple text-anime-dark py-2 px-4 rounded-xl text-sm font-semibold hover:shadow-anime-glow-cyan transition-all"
            >
              Install App
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-anime-text-secondary hover:text-anime-text-primary transition-colors text-sm"
            >
              Not now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstallPrompt;