import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import appLogo from '/mynextread-app.png';
import desktop1 from '../assets/Hero-section/Desktop/desktop(1).jpg';
import desktop2 from '../assets/Hero-section/Desktop/desktop(2).jpg';
import desktop4 from '../assets/Hero-section/Desktop/desktop(4).jpg';
import desktop5 from '../assets/Hero-section/Desktop/desktop(5).jpg';
import mobile1 from '../assets/Hero-section/mobile/potrait(1).jpg';
import mobile2 from '../assets/Hero-section/mobile/potrait(2).jpg';
import mobile3 from '../assets/Hero-section/mobile/potrait(3).jpg';
import mobile4 from '../assets/Hero-section/mobile/potrait(4).jpg';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  
  // Background animation state
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  
  const desktopImages = [desktop1, desktop2, desktop4, desktop5];
  const mobileImages = [mobile1, mobile2, mobile3, mobile4];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % desktopImages.length);
    }, 7000); // Change every 7 seconds

    return () => clearInterval(interval);
  }, [desktopImages.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement Firebase password reset
    console.log('Password reset request for:', email);
    setTimeout(() => {
      setIsLoading(false);
      setIsEmailSent(true);
    }, 1000); // Temporary loading simulation
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative overflow-hidden">
        {/* Animated Hero Background */}
        <div className="absolute inset-0 z-0">
          {/* Desktop Background */}
          <div className="hidden md:block absolute inset-0">
            {desktopImages.map((image, index) => (
              <div
                key={`desktop-${index}`}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentBgIndex ? 'opacity-60' : 'opacity-0'
                }`}
              >
                <img
                  src={image}
                  alt={`Auth Background ${index + 1}`}
                  className="w-full h-full object-cover"
                  style={{
                    filter: 'brightness(0.4) contrast(1.1) saturate(1.2)'
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* Mobile Background */}
          <div className="md:hidden absolute inset-0">
            {mobileImages.map((image, index) => (
              <div
                key={`mobile-${index}`}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === (currentBgIndex % mobileImages.length) ? 'opacity-60' : 'opacity-0'
                }`}
              >
                <img
                  src={image}
                  alt={`Auth Mobile Background ${index + 1}`}
                  className="w-full h-full object-cover"
                  style={{
                    filter: 'brightness(0.4) contrast(1.1) saturate(1.2)'
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 w-full max-w-md text-center">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
            <p className="text-gray-400 mb-6">
              We've sent a password reset link to <span className="text-purple-400">{email}</span>
            </p>
            <div className="space-y-4">
              <Link
                to="/login"
                className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                Back to Sign In
              </Link>
              <button
                onClick={() => setIsEmailSent(false)}
                className="w-full text-purple-400 hover:text-purple-300 py-2 transition-colors"
              >
                Try a different email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Hero Background */}
      <div className="absolute inset-0 z-0">
        {/* Desktop Background */}
        <div className="hidden md:block absolute inset-0">
          {desktopImages.map((image, index) => (
            <div
              key={`desktop-${index}`}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentBgIndex ? 'opacity-60' : 'opacity-0'
              }`}
            >
              <img
                src={image}
                alt={`Auth Background ${index + 1}`}
                className="w-full h-full object-cover"
                style={{
                  filter: 'brightness(0.4) contrast(1.1) saturate(1.2)'
                }}
              />
            </div>
          ))}
        </div>
        
        {/* Mobile Background */}
        <div className="md:hidden absolute inset-0">
          {mobileImages.map((image, index) => (
            <div
              key={`mobile-${index}`}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === (currentBgIndex % mobileImages.length) ? 'opacity-60' : 'opacity-0'
              }`}
            >
              <img
                src={image}
                alt={`Auth Mobile Background ${index + 1}`}
                className="w-full h-full object-cover"
                style={{
                  filter: 'brightness(0.4) contrast(1.1) saturate(1.2)'
                }}
              />
            </div>
          ))}
        </div>
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src={appLogo} 
              alt="MyNextRead" 
              className="w-20 h-20 rounded-2xl shadow-2xl"
            />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            MyNextRead
          </h1>
          <p className="text-gray-400">Reset your password</p>
        </div>

        {/* Forgot Password Form */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-2 text-center">Forgot Password?</h2>
          <p className="text-gray-400 text-center mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                placeholder="Enter your email address"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending reset link...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;