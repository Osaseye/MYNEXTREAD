import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Generate service worker and manifest files in the correct location
    rollupOptions: {
      input: {
        main: './index.html',
      }
    }
  },
  server: {
    // Enable HTTPS for PWA testing if needed
    // https: true,
    host: true, // Allow external access for mobile testing
  },
  // Ensure PWA assets are served correctly
  publicDir: 'public',
})
