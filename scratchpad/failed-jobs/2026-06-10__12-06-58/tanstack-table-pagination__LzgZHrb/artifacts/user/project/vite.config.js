import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // During development, proxy API calls to the Express backend
    proxy: {
      '/api': {
        target: 'http://localhost:8321',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
