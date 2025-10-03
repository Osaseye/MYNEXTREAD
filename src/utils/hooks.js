import { useState, useEffect } from 'react';

// Custom hook for debounced values
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Loading states utility
export const LoadingState = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Format text utility
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Clean HTML from descriptions
export const cleanHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
};