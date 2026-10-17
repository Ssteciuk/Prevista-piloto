// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // URL pública final. Canonical, og:image y sitemap salen de acá. Mantenerla igual que `seo.sitio` en src/data/proyecto.ts.
  site: 'https://casa-lumbre.example.com',
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
  vite: {
    plugins: [tailwindcss()],
  },
});
