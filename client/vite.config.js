import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Core React — always needed
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('use-sync-external-store')) {
              return 'vendor-react';
            }
            // Framer Motion — used on many pages but heavy
            if (id.includes('framer-motion')) {
              return 'vendor-framer-motion';
            }
            // Stripe — only needed on payment page
            if (id.includes('@stripe')) {
              return 'vendor-stripe';
            }
            // PDF/Canvas — only needed for certificates
            if (id.includes('html2canvas') || id.includes('jspdf')) {
              return 'vendor-pdf';
            }
            // Video player — only needed on course player
            if (id.includes('react-player') || id.includes('react-youtube')) {
              return 'vendor-video';
            }
            // Icons — large tree-shakeable lib
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // TinyMCE — only for instructors
            if (id.includes('tinymce')) {
              return 'vendor-editor';
            }
            // Axios + other small utils
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})
