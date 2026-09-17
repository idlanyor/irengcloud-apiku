import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // API di-proxy ke Express di dev — frontend selalu pakai fetch relative
      '/api': 'http://localhost:8410',
    },
  },
  build: {
    outDir: 'dist',
  },
});
