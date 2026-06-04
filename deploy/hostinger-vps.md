# Host Vidmate on Hostinger VPS (KVM2) — subdomain

Example subdomain: **`vidmate.yourdomain.com`** (replace with yours).

---

## 1. DNS (Hostinger hPanel or domain DNS)

| Type | Name      | Value              | TTL  |
|------|-----------|--------------------|------|
| A    | `vidmate` | Your VPS public IP | 300  |

Wait 5–30 minutes for DNS to propagate. Check: `ping vidmate.yourdomain.com`

---

## 2. On your VPS (SSH as root or sudo user)

### Install packages (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx git
```

Install Node.js 20+ (for building on the server):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v
```

---

## 3. Upload the project

**Option A — Git (recommended)**

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone YOUR_REPO_URL vidmate-src
sudo chown -R $USER:$USER vidmate-src
cd vidmate-src
```

**Option B — Copy from your PC (PowerShell)**

```bash
scp -r C:\Users\ashok\Downloads\vidmate user@YOUR_VPS_IP:/var/www/vidmate-src
```

---

## 4. Environment & build

```bash
cd /var/www/vidmate-src
cp .env.example .env.local
nano .env.local
```

Set at minimum:

```env
VITE_SITE_URL="https://vidmate.yourdomain.com"
VITE_GOOGLE_SITE_VERIFICATION="your-search-console-code"
VITE_ADSENSE_CLIENT="ca-pub-XXXXXXXXXXXXXXXX"
```

Edit `public/ads.txt` with the line from Google AdSense.

Build:

```bash
npm install --ignore-scripts
npm run build
```

Deploy static files:

```bash
sudo mkdir -p /var/www/vidmate
sudo rsync -av --delete dist/ /var/www/vidmate/
sudo chown -R www-data:www-data /var/www/vidmate
```

Or use the script:

```bash
chmod +x deploy/build-and-publish.sh
./deploy/build-and-publish.sh
```

---

## 5. Nginx

```bash
sudo cp deploy/nginx-subdomain.conf.example /etc/nginx/sites-available/vidmate
sudo nano /etc/nginx/sites-available/vidmate
```

Change `SUBDOMAIN.DOMAIN` → e.g. `vidmate.yourdomain.com`

```bash
sudo ln -sf /etc/nginx/sites-available/vidmate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. HTTPS (Let’s Encrypt)

```bash
sudo certbot --nginx -d vidmate.yourdomain.com
```

Renewal is automatic via certbot timer.

---

## 7. Google Search Console & AdSense

1. Search Console → add property: `https://vidmate.yourdomain.com`
2. Verify with `VITE_GOOGLE_SITE_VERIFICATION` in `.env.local`, rebuild, republish
3. Submit sitemap: `https://vidmate.yourdomain.com/sitemap.xml`
4. Confirm `https://vidmate.yourdomain.com/ads.txt` is reachable

---

## 8. Updates (after code changes)

On the VPS:

```bash
cd /var/www/vidmate-src
git pull   # if using git
npm run build
sudo rsync -av --delete dist/ /var/www/vidmate/
```

---

## Firewall (if UFW is enabled)

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| 502 / blank page | `sudo nginx -t`, check `/var/www/vidmate/index.html` exists |
| `/privacy` 404 | Ensure `try_files ... /index.html` in nginx config |
| Wrong site on subdomain | Check `server_name` matches subdomain exactly |
| Ads not showing | `ads.txt` live, AdSense approved, `VITE_ADSENSE_CLIENT` set at build time |
