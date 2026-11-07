import { defineConfig, passthroughImageService } from 'astro/config';

export default defineConfig({
  site: 'https://fluff.care',
  output: 'static',
  image: {
    service: passthroughImageService(),
  },
});
