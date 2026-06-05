# Fix YouTube “bot check” on the VPS

YouTube blocks datacenter IPs. Export cookies from **your** browser (while logged into YouTube), upload to the server, restart the API.

## Step 1 — Export cookies (Windows, Chrome)

1. Install the Chrome extension **“Get cookies.txt LOCALLY”** (only use a well-reviewed one).
2. Open https://www.youtube.com and make sure you are **signed in**.
3. Click the extension → export cookies for `youtube.com` → save as `cookies.txt` on your PC (e.g. `Downloads\cookies.txt`).

Format must be **Netscape cookies.txt** (what yt-dlp expects).

## Step 2 — Upload to the VPS

In **PowerShell** on your PC:

```powershell
scp -i $env:USERPROFILE\.ssh\vidmate_deploy C:\Users\ashok\Downloads\cookies.txt root@147.93.108.231:/var/www/vidmate-api/cookies.txt
```

## Step 3 — Enable cookies in PM2 and restart

```powershell
ssh -i $env:USERPROFILE\.ssh\vidmate_deploy root@147.93.108.231
```

On the server:

```bash
chmod 600 /var/www/vidmate-api/cookies.txt
chown root:root /var/www/vidmate-api/cookies.txt
cd /var/www/vidmate-api
# ecosystem.config.cjs should include YTDLP_COOKIES_FILE (see repo)
pm2 restart vidmate-api
```

## Step 4 — Verify

Open: https://vidmate.ai-workflows.cloud/api/health  

You should see `"cookiesConfigured": true`.

Retry the same YouTube link on the site.

## Notes

- Refresh `cookies.txt` every few weeks if downloads start failing again.
- Never commit `cookies.txt` to GitHub (it is a secret).
- Other platforms (Vimeo, many TikTok links) may work **without** cookies.
