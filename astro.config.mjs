import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import site from './src/data/site.json';

export default defineConfig({
  site: site.url,
  integrations: [sitemap()],
  build: { inlineStylesheets: 'always' },
});
