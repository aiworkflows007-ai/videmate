# Real downloads to your computer (one-time VPS setup)

The website now downloads **real files** to your PC/phone **Downloads folder** using **yt-dlp** on the server.

## On your VPS (SSH in with CMD)

```cmd
ssh -i %USERPROFILE%\.ssh\vidmate_deploy root@147.93.108.231
```

Run these **one line at a time**:

```bash
apt update
apt install -y yt-dlp ffmpeg
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
mkdir -p /var/www/vidmate-api
```

After the next GitHub deploy, or manually copy `server/` + `package.json` + `ecosystem.config.cjs` to `/var/www/vidmate-api`, then:

```bash
cd /var/www/vidmate-api
npm install --omit=dev --ignore-scripts
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## Update Nginx (add API proxy)

Edit your site config:

```bash
nano /etc/nginx/sites-available/vidmate
```

Add this block **before** `location / {`:

```nginx
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_read_timeout 600s;
        client_max_body_size 20m;
    }
```

Then:

```bash
nginx -t
systemctl reload nginx
```

## Test

Open: https://vidmate.ai-workflows.cloud/api/health  

Should show: `"ok": true, "ytdlp": true`

Paste a YouTube link → when finished, your browser saves the file locally.

## Legal note

Only download content you have rights to use.
