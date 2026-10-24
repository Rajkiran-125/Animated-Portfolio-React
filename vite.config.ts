import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        // three / r3f / drei are reached only through the lazy HeroScene import,
        // so Rollup keeps them out of the entry. Only split stable vendor libs here.
        manualChunks: {
          gsap: ['gsap'],
          motion: ['framer-motion'],
        },
      },
    },
  },
});
