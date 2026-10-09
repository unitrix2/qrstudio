import { defineConfig } from 'vite';

export default defineConfig({
  // Use relative paths so it works on any subdirectory (GitHub Pages /<repo>/)
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
