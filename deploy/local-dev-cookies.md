# Test downloads on localhost (with cookies)

## 1. Put your new cookies file here

Copy your exported file to:

```text
C:\Users\ashok\Downloads\vidmate\cookies.txt
```

(Or update `YTDLP_COOKIES_FILE` in `.env.local` if you keep it elsewhere.)

**Do not commit `cookies.txt`** — it is in `.gitignore`.

## 2. Install yt-dlp on Windows (once)

```powershell
winget install yt-dlp
# or: pip install -U yt-dlp
```

Check:

```powershell
yt-dlp --version
```

## 3. Run two terminals

**Terminal A — API**

```powershell
cd C:\Users\ashok\Downloads\vidmate
npm run dev:api
```

Should print: `Vidmate API listening on http://127.0.0.1:3001`

**Terminal B — Website**

```powershell
cd C:\Users\ashok\Downloads\vidmate
npm run dev
```

Open: http://127.0.0.1:5173

## 4. Verify cookies

http://127.0.0.1:5173/api/health  

Expect: `"cookiesConfigured": true`

## 5. Test a download

Paste a YouTube link → pick Video 720P or Audio → Active Downloads.

When it works locally, upload the same `cookies.txt` to the VPS (see `youtube-cookies.md`).
