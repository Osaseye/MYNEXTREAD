/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Full Black Color Palette
        'anime-dark': '#000000',
        'anime-darker': '#0a0a0a',
        'anime-card': '#1a1a1a',
        'anime-accent': '#2a2a2a',
        'anime-hover': '#333333',
        
        // Neon Accent Colors
        'anime-cyan': '#00D4FF',
        'anime-pink': '#FF1B6B',
        'anime-purple': '#8B5CF6',
        'anime-gold': '#FFD700',
        'anime-green': '#00FF88',
        
        // Text Colors
        'anime-text': {
          primary: '#E8E9F0',
          secondary: '#B0B3C1',
          muted: '#8A8D9A',
          accent: '#00D4FF',
        }
      },
      fontFamily: {
        'anime': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'anime-card': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'anime-hover': '0 12px 40px rgba(0, 212, 255, 0.2)',
        'anime-glow-cyan': '0 0 20px rgba(0, 212, 255, 0.3)',
        'anime-glow-pink': '0 0 20px rgba(255, 27, 107, 0.3)',
        'anime-glow-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
      },
      backdropBlur: {
        'anime': '10px',
      },
      animation: {
        'anime-pulse': 'anime-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'anime-float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'anime-pulse': {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1.05)',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(120deg)' },
          '66%': { transform: 'translateY(5px) rotate(240deg)' },
        },
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
}

