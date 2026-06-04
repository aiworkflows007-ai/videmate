<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ba658b1c-a6d9-4e70-945e-f217a45e53f6

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies: `npm install --ignore-scripts` (use plain `npm install` if scripts work on your machine)
2. Copy [.env.example](.env.example) to `.env.local` and set `VITE_SITE_URL`, AdSense, and Search Console values
3. Run: `node node_modules/vite/bin/vite.js --port=5173` or `npm run dev`

## Google AdSense & SEO

1. Deploy to a **custom domain** (HTTPS). Update `public/ads.txt` with your publisher line from AdSense.
2. In `.env.local` set `VITE_ADSENSE_CLIENT=ca-pub-...` and optional slot IDs.
3. [Google Search Console](https://search.google.com/search-console): add property, verify with `VITE_GOOGLE_SITE_VERIFICATION`, submit `sitemap.xml`.
4. On `npm run build`, `robots.txt` and `sitemap.xml` in `dist/` are auto-generated when `VITE_SITE_URL` is set.

**Note:** Video downloader sites may be declined by AdSense or ranked poorly if they encourage copyright infringement. Use only for lawful content and comply with platform terms.

## Hostinger VPS (subdomain)

See **[deploy/hostinger-vps.md](deploy/hostinger-vps.md)** for DNS, Nginx, SSL, and publish steps (e.g. `vidmate.yourdomain.com`).

## GitHub → auto deploy (Actions)

Push to **`main`** and GitHub builds + deploys to your VPS. Setup: **[deploy/github-actions.md](deploy/github-actions.md)** (SSH secrets + `VITE_SITE_URL`).
