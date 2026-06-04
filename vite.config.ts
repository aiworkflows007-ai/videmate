import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';

function seoPublicFilesPlugin(siteUrl: string): Plugin {
  return {
    name: 'seo-public-files',
    closeBundle() {
      if (!siteUrl) return;
      const base = siteUrl.replace(/\/$/, '');
      const dist = path.resolve(__dirname, 'dist');

      const robots = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`;
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${base}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${base}/privacy</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>${base}/terms</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
</urlset>
`;

      fs.mkdirSync(dist, { recursive: true });
      fs.writeFileSync(path.join(dist, 'robots.txt'), robots);
      fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = env.VITE_SITE_URL?.trim() || '';

  return {
    plugins: [react(), tailwindcss(), seoPublicFilesPlugin(siteUrl)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
        },
      },
    },
  };
});
