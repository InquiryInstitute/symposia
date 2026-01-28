// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://inquiryinstitute.github.io',
  base: '/symposia',
  build: {
    assets: 'assets'
  }
});
