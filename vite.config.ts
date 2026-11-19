import { defineConfig } from 'vitest/config';
import { conceptEditor } from './tools/edytor/plugin.ts';

export default defineConfig({
  base: './',
  // Dev server only: the concept editor at /edytor (see tools/edytor/).
  plugins: [conceptEditor()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1200,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
