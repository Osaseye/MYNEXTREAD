import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Tv, Heart, ArrowRight, Star, Play, Download, Eye } from 'lucide-react';
import logoImage from '/mynextread-app.png';
import { useScrollAnimation, useStaggeredAnimation, FADE_UP, FADE_UP_VISIBLE, FADE_UP_HIDDEN } from '../utils/animations.jsx';

// Import desktop images
import desktop1 from '../assets/Hero-section/Desktop/desktop(1).jpg';
import desktop2 from '../assets/Hero-section/Desktop/desktop(2).jpg';
import desktop4 from '../assets/Hero-section/Desktop/desktop(4).jpg';
import desktop5 from '../assets/Hero-section/Desktop/desktop(5).jpg';

// Import mobile images
import mobile1 from '../assets/Hero-section/mobile/potrait(1).jpg';
import mobile2 from '../assets/Hero-section/mobile/potrait(2).jpg';
import mobile3 from '../assets/Hero-section/mobile/potrait(3).jpg';
import mobile4 from '../assets/Hero-section/mobile/potrait(4).jpg';

// Import app screenshots
import screenshot1 from '../assets/inAPPui/Screenshot (276).png';
import screenshot2 from '../assets/inAPPui/Screenshot (277).png';
import screenshot3 from '../assets/inAPPui/Screenshot (282).png';
import screenshot4 from '../assets/inAPPui/Screenshot (283).png';

// Static images from folders - moved outside component to avoid re-creation
const DESKTOP_IMAGES = [desktop1, desktop2, desktop4, desktop5];
const MOBILE_IMAGES = [mobile1, mobile2, mobile3, mobile4];
const APP_SCREENSHOTS = [screenshot1, screenshot2, screenshot3, screenshot4];

const Landing = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState('Read');
  const [heroRef, heroVisible] = useScrollAnimation();
  const [screenshotsRef, screenshotsVisible, getItemDelay, getItemClass] = useStaggeredAnimation(3, 150);
  const [ctaRef, ctaVisible] = useScrollAnimation();

  // Use only static images
  const [allImages, setAllImages] = useState([...DESKTOP_IMAGES]);

  // Initialize with static images only
  useEffect(() => {
    setAllImages(DESKTOP_IMAGES);
  }, []);

  // Rotate images every 7 seconds
  useEffect(() => {
    if (allImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
      }, 7000);

      return () => clearInterval(interval);
    }
  }, [allImages]);

  // Alternate between "Read" and "Watch" every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => prev === 'Read' ? 'Watch' : 'Read');
    }, 3000);

    return () => clearInterval(interval);
  }, []);



  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Smart Recommendations",
      description: "Get personalized suggestions based on your preferences and viewing history.",
      screenshot: APP_SCREENSHOTS[0]
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "All-in-One Discovery",
      description: "Explore anime, manga, and light novels seamlessly in one beautiful interface.",
      screenshot: APP_SCREENSHOTS[1]
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Personal Library",
      description: "Save favorites and build your personal collection with smart organization.",
      screenshot: APP_SCREENSHOTS[2]
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-anime-dark">
      {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Hero Background Images */}
          <div className="absolute inset-0 z-0">
            {/* Desktop Background */}
            <div className="hidden md:block absolute inset-0">
              {allImages.map((image, index) => (
                <div
                  key={`desktop-${index}`}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentImageIndex ? 'opacity-60' : 'opacity-0'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Hero Background ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{
                      filter: 'brightness(0.7) contrast(1.1) saturate(1.2)'
                    }}
                  />
                </div>
              ))}
            </div>
            
            {/* Mobile Background */}
            <div className="md:hidden absolute inset-0">
              {MOBILE_IMAGES.map((image, index) => (
                <div
                  key={`mobile-${index}`}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === (currentImageIndex % MOBILE_IMAGES.length) ? 'opacity-60' : 'opacity-0'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Hero Mobile Background ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{
                      filter: 'brightness(0.7) contrast(1.1) saturate(1.2)'
                    }}
                  />
                </div>
              ))}
            </div>
            
            {/* Overlay Gradients - Reduced opacity for better image visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-anime-dark/50 via-anime-dark/30 to-anime-dark/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-anime-dark/20 via-transparent to-anime-dark/20" />
          </div>

          <div 
            ref={heroRef}
            className={`relative z-10 text-center max-w-6xl mx-auto space-y-8 ${FADE_UP} ${
              heroVisible ? FADE_UP_VISIBLE : FADE_UP_HIDDEN
            }`}
          >

            {/* Main Title with Animation */}
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight text-anime-text-primary">
                My<span className="text-anime-cyan">Next</span>
                <span className="inline-block relative ml-2 overflow-hidden" style={{ height: '1.2em', minWidth: '6ch' }}>
                  <span 
                    className="block transition-transform duration-700 ease-in-out"
                    style={{
                      transform: currentWord === 'Read' ? 'translateY(0%)' : 'translateY(-100%)',
                    }}
                  >
                    Read
                  </span>
                  <span 
                    className="block absolute top-full left-0 transition-transform duration-700 ease-in-out"
                    style={{
                      transform: currentWord === 'Watch' ? 'translateY(-100%)' : 'translateY(0%)',
                    }}
                  >
                    Watch
                  </span>
                </span>
              </h1>
              <div className="h-2 w-48 mx-auto bg-gradient-to-r from-anime-cyan via-anime-purple to-anime-pink rounded-full animate-pulse" />
            </div>

            {/* Dynamic Subtitle */}
            <p className="text-xl sm:text-2xl lg:text-3xl text-anime-text-secondary max-w-4xl mx-auto leading-relaxed">
              Break free from choice paralysis and discover your next 
              <span className="text-anime-cyan font-bold mx-2 animate-pulse">obsession</span> 
              with smart recommendations
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Link 
                to="/register" 
                className="group relative bg-gradient-to-r from-anime-cyan to-anime-purple px-10 py-5 rounded-2xl font-bold text-xl text-anime-dark hover:shadow-anime-glow-cyan transition-all duration-300 transform hover:scale-105 flex items-center space-x-3"
              >
                <Star className="w-6 h-6" />
                <span>Get Started Free</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
              
              <Link 
                to="/login" 
                className="group relative bg-anime-card/50 backdrop-blur-sm border-2 border-anime-purple/50 px-10 py-5 rounded-2xl font-bold text-xl text-anime-text-primary hover:border-anime-cyan hover:shadow-anime-glow-purple transition-all duration-300 flex items-center space-x-3"
              >
                <Play className="w-6 h-6 text-anime-purple" />
                <span>Sign In</span>
              </Link>
            </div>
          </div>
        </section>

        {/* App Screenshots Section */}
        <section 
          ref={screenshotsRef}
          className={`py-24 px-4 sm:px-6 lg:px-8 relative ${FADE_UP} ${
            screenshotsVisible ? FADE_UP_VISIBLE : FADE_UP_HIDDEN
          }`}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-5xl font-bold text-anime-text-primary mb-6">
                Experience <span className="text-anime-purple">MyNextRead</span>
              </h2>
              <p className="text-xl text-anime-text-secondary max-w-3xl mx-auto">
                See how easy it is to discover your next favorite content with our intuitive interface
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className={getItemClass(index, 'group relative')}
                  style={{
                    transitionDelay: getItemDelay(index),
                  }}
                >
                  {/* Floating Screenshot */}
                  <div className="relative mb-8 group-hover:scale-105 transition-all duration-500">
                    <div className="relative overflow-hidden rounded-3xl shadow-anime-glow-cyan group-hover:shadow-anime-glow-purple transition-all duration-500">
                      <img
                        src={feature.screenshot}
                        alt={`${feature.title} Screenshot`}
                        className="w-full h-auto transform group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-anime-dark/30 via-transparent to-transparent" />
                      
                      {/* Floating Action Button */}
                      <div className="absolute top-4 right-4 w-12 h-12 bg-anime-cyan/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                        <Eye className="w-6 h-6 text-anime-dark" />
                      </div>
                    </div>
                    
                    {/* Floating Border Animation */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-anime-cyan/30 group-hover:border-anime-purple/50 transition-all duration-500 animate-pulse" />
                  </div>

                  {/* Feature Info */}
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-anime-cyan to-anime-purple rounded-2xl flex items-center justify-center shadow-anime-glow-cyan group-hover:shadow-anime-glow-purple transition-all duration-300">
                        <div className="text-anime-dark group-hover:scale-110 transition-transform">
                          {feature.icon}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-anime-text-primary group-hover:text-anime-cyan transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-anime-text-secondary leading-relaxed text-lg">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          ref={ctaRef}
          className={`py-24 px-4 sm:px-6 lg:px-8 text-center relative ${FADE_UP} ${
            ctaVisible ? FADE_UP_VISIBLE : FADE_UP_HIDDEN
          }`}
        >
          <div className="max-w-5xl mx-auto space-y-12">
            {/* Animated Background Element */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="w-96 h-96 bg-gradient-to-r from-anime-cyan to-anime-purple rounded-full blur-3xl animate-pulse" />
            </div>
            
            <div className="relative space-y-8">
              <div className="space-y-6">
                <h2 className="text-4xl lg:text-6xl font-bold text-anime-text-primary">
                  Ready to find your next 
                  <span className="block text-anime-cyan mt-2">obsession?</span>
                </h2>
                <p className="text-xl lg:text-2xl text-anime-text-secondary max-w-3xl mx-auto">
                  Join thousands of anime and manga enthusiasts who've already discovered their perfect next story
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link 
                  to="/register" 
                  className="group relative bg-gradient-to-r from-anime-pink via-anime-purple to-anime-cyan px-12 py-6 rounded-3xl font-bold text-2xl text-anime-dark hover:shadow-anime-glow-pink transition-all duration-300 transform hover:scale-105 flex items-center space-x-4"
                >
                  <Star className="w-8 h-8 animate-spin" />
                  <span>Join MyNextRead</span>
                  <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-anime-hover bg-anime-card/30">
          <div className="max-w-6xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <img 
                src={logoImage} 
                alt="MyNextRead Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-2xl font-bold text-anime-text-primary">
                My<span className="text-anime-cyan">Next</span>Read
              </span>
            </div>
            
            <p className="text-anime-text-secondary max-w-2xl mx-auto">
              Discover your next favorite anime, manga, or light novel without the overwhelming choice paralysis.
            </p>
            
            <div className="flex justify-center space-x-8 text-anime-text-secondary">
              <Link to="/login" className="hover:text-anime-cyan transition-colors">Sign In</Link>
              <Link to="/register" className="hover:text-anime-cyan transition-colors">Sign Up</Link>

              <Link to="/explore" className="hover:text-anime-cyan transition-colors">Explore</Link>
            </div>
            
            <div className="text-sm text-anime-text-secondary/70 border-t border-anime-hover pt-6">
              © 2025 MyNextRead by Adebowale Oluwasegun. Powered by AniList API.
            </div>
          </div>
        </footer>
    </div>
  );
};

export default Landing;