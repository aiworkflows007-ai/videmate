# Deploy with GitHub Actions → Hostinger VPS

Every push to **`main`** builds the site and uploads `dist/` to your VPS.

---

## One-time VPS setup

SSH into the VPS and run once:

```bash
sudo mkdir -p /var/www/vidmate
sudo chown -R $USER:www-data /var/www/vidmate
```

Install Nginx + SSL using [hostinger-vps.md](./hostinger-vps.md).

---

## 1. Create GitHub repository

1. [github.com/new](https://github.com/new) → name e.g. `vidmate`
2. Do **not** add README if you already have local code

On your PC:

```powershell
cd C:\Users\ashok\Downloads\vidmate
git init
git add .
git commit -m "Initial commit: Vidmate app with GitHub Actions deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vidmate.git
git push -u origin main
```

---

## 2. Add GitHub Secrets

Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Example | Required |
|--------|---------|----------|
| `VPS_HOST` | `123.45.67.89` or server hostname | Yes |
| `VPS_USER` | `root` or `ubuntu` | Yes |
| `VPS_SSH_KEY` | Full private key (PEM) | Yes |
| `VPS_WEB_ROOT` | `/var/www/vidmate` | No (default in workflow) |
| `VPS_PORT` | `22` | No |
| `VITE_SITE_URL` | `https://vidmate.yourdomain.com` | Yes (SEO + build) |
| `VITE_GOOGLE_SITE_VERIFICATION` | Search Console code | No |
| `VITE_ADSENSE_CLIENT` | `ca-pub-...` | No |
| `VITE_ADSENSE_SLOT_HOME` | Ad unit slot ID | No |
| `VITE_ADSENSE_SLOT_SIDEBAR` | Ad unit slot ID | No |

### SSH key for GitHub Actions

On your PC:

```powershell
ssh-keygen -t ed25519 -C "github-actions-vidmate" -f $env:USERPROFILE\.ssh\vidmate_deploy
```

- **Public key** → add to VPS `~/.ssh/authorized_keys` for `VPS_USER`
- **Private key** → paste entire contents into GitHub secret `VPS_SSH_KEY`

Test:

```powershell
ssh -i $env:USERPROFILE\.ssh\vidmate_deploy VPS_USER@VPS_HOST
```

---

## 3. Edit `public/ads.txt` before first deploy

Replace the placeholder publisher ID with the line from Google AdSense, then commit.

---

## 4. Run deploy

- Push to `main`, or
- **Actions** tab → **Deploy to VPS** → **Run workflow**

Check **Actions** for green checkmark, then open your subdomain in the browser.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| SCP permission denied | Ensure `VPS_USER` can write to `VPS_WEB_ROOT`; use `sudo chown` |
| Build OK, site old | Hard refresh browser; confirm workflow uploaded to correct path |
| `npm run build` fails in CI | Check Actions log; ensure secrets names match exactly |
| Nginx 404 on `/privacy` | Nginx `try_files` → `/index.html` (see nginx example) |
