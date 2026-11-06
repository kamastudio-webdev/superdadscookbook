import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://superdadscookbook.com',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
