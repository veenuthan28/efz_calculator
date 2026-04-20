import { defineConfig } from 'astro/config';

export default defineConfig({
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    build: {
      assetsInlineLimit: 100000,
    },
  },
});
