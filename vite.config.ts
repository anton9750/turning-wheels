import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works on any GitHub Pages repo path.
export default defineConfig({
  plugins: [react()],
  base: './',
});
