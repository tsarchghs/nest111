import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'published',   // <-- Vite will emit files here for Bolt
    emptyOutDir: true,     // Clears the folder before each build
    rollupOptions: {
      input: 'index.html', // entry point for your client
    },
  },
});