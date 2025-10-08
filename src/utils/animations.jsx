import { useState, useEffect, useRef } from 'react';

// Custom hook for scroll animations
export const useScrollAnimation = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true
  } = options;
  
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(entry.target);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isVisible];
};

// Scroll animations for staggered items
export const useStaggeredAnimation = (itemCount, delay = 100) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const getItemDelay = (index) => isVisible ? `${index * delay}ms` : '0ms';
  const getItemClass = (index, baseClass = '') => {
    return `${baseClass} transition-all duration-700 ${
      isVisible 
        ? 'opacity-100 translate-y-0 scale-100' 
        : 'opacity-0 translate-y-8 scale-95'
    }`;
  };

  return [ref, isVisible, getItemDelay, getItemClass];
};

// Animation classes
export const FADE_UP = 'transition-all duration-1000 ease-out';
export const FADE_UP_VISIBLE = 'opacity-100 translate-y-0';
export const FADE_UP_HIDDEN = 'opacity-0 translate-y-10';

export const SLIDE_IN_LEFT = 'transition-all duration-800 ease-out';
export const SLIDE_IN_LEFT_VISIBLE = 'opacity-100 translate-x-0';
export const SLIDE_IN_LEFT_HIDDEN = 'opacity-0 -translate-x-10';

export const SLIDE_IN_RIGHT = 'transition-all duration-800 ease-out';
export const SLIDE_IN_RIGHT_VISIBLE = 'opacity-100 translate-x-0';
export const SLIDE_IN_RIGHT_HIDDEN = 'opacity-0 translate-x-10';

export const SCALE_IN = 'transition-all duration-600 ease-out';
export const SCALE_IN_VISIBLE = 'opacity-100 scale-100';
export const SCALE_IN_HIDDEN = 'opacity-0 scale-95';

// Page transition wrapper
export const PageTransition = ({ children, className = '' }) => {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.05 });
  
  return (
    <div
      ref={ref}
      className={`${FADE_UP} ${
        isVisible ? FADE_UP_VISIBLE : FADE_UP_HIDDEN
      } ${className}`}
    >
      {children}
    </div>
  );
};