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
        proxy_pass http://127.0.0.1:3017/api/;
        proxy_read_timeout 600s;
        client_max_body_size 20m;
    }
```

Then:

```bash
nginx -t
systemctl reload nginx
```

## Supported links (same as the website)

| Platform | Example link types |
|----------|-------------------|
| YouTube | `youtube.com/watch`, `youtu.be/...` |
| Instagram | Posts, reels (`instagram.com/reel/...`) |
| TikTok | `tiktok.com/@user/video/...` |
| Twitter / X | `twitter.com/...`, `x.com/...` |
| Facebook | `facebook.com/watch`, `fb.watch/...` |
| Vimeo | `vimeo.com/123456` |

**Instagram & Facebook:** Some videos need login. Optional: export browser cookies to `/var/www/vidmate-api/cookies.txt` and set in `ecosystem.config.cjs`:

```js
YTDLP_COOKIES_FILE: '/var/www/vidmate-api/cookies.txt',
```

Then `pm2 restart vidmate-api`.

## Test

Open: https://vidmate.ai-workflows.cloud/api/health  

Should show: `"ok": true`, `"ytdlp": true`, and a list of `platforms`.

Try each site from the home page platform cards.

## Legal note

Only download content you have rights to use.
