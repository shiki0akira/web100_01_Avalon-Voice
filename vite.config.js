import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Use relative asset paths so it works for both
  // GitHub Pages subpaths and a custom domain at the root.
  base: './',
  plugins: [react()],
});
