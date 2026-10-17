import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the client runs on :5173 and proxies API + upload requests to
// the Express server on :4000, so `npm run dev` from the project root just works.
export default defineConfig({
  plugins: [react()],
  // Share the project-root .env with the API. Vite only exposes VITE_ variables.
  envDir: '..',
  // Relative asset paths so the built dist/ folder can be opened directly in a
  // browser (demo mode) without a server.
  base: './',
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
    },
  },
  build: {
    outDir: 'dist',
  },
});
