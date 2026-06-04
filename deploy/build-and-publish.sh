#!/usr/bin/env bash
# Build Vidmate and publish to /var/www/vidmate (nginx root)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB_ROOT="${WEB_ROOT:-/var/www/vidmate}"

cd "$ROOT"

if [[ ! -f .env.local ]]; then
  echo "Create .env.local from .env.example (set VITE_SITE_URL to your subdomain URL)."
  exit 1
fi

echo "==> Installing dependencies..."
npm install --ignore-scripts

echo "==> Building..."
npm run build

echo "==> Publishing to ${WEB_ROOT}..."
sudo mkdir -p "$WEB_ROOT"
sudo rsync -av --delete dist/ "$WEB_ROOT/"
sudo chown -R www-data:www-data "$WEB_ROOT"

echo "Done. Site files are in ${WEB_ROOT}"
echo "Reload nginx: sudo systemctl reload nginx"
