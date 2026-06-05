#!/bin/bash
# Run on VPS as root: bash fix-api-404.sh
set -e

echo "=== Installing yt-dlp, ffmpeg, Node ==="
apt update
apt install -y yt-dlp ffmpeg curl
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi
npm install -g pm2

echo "=== API app ==="
mkdir -p /var/www/vidmate-api
cd /var/www/vidmate-api
if [ ! -f server/index.js ]; then
  echo "ERROR: /var/www/vidmate-api/server/index.js missing. Run GitHub deploy first."
  exit 1
fi
npm install --omit=dev --ignore-scripts
pm2 delete vidmate-api 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

echo "=== Nginx /api proxy ==="
NGINX_SITE="/etc/nginx/sites-available/vidmate"
if ! grep -q "location /api/" "$NGINX_SITE" 2>/dev/null; then
  sed -i '/location \/ {/i \
    location /api/ {\
        proxy_pass http://127.0.0.1:3017/api/;\
        proxy_http_version 1.1;\
        proxy_set_header Host $host;\
        proxy_read_timeout 600s;\
        client_max_body_size 20m;\
    }\
' "$NGINX_SITE"
fi
nginx -t
systemctl reload nginx

echo "=== Test ==="
curl -s http://127.0.0.1:3017/api/health | head -c 200
echo ""
echo "Done. Open https://vidmate.ai-workflows.cloud/api/health in browser."
