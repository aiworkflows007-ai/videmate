# Deploy failed (red X) — fix in plain English

Click the failed run → click **build-and-deploy** → open the **red** step. Match your error below.

---

## 1. "Missing secret VPS_HOST" (or VPS_USER / VPS_SSH_KEY)

**Fix:** Add all 5 secrets: https://github.com/aiworkflows007-ai/videmate/settings/secrets/actions

| Secret | Value |
|--------|--------|
| VPS_HOST | 147.93.108.231 |
| VPS_USER | root |
| VPS_SSH_KEY | Full private key file (see below) |
| VITE_SITE_URL | https://vidmate.ai-workflows.cloud |
| VPS_WEB_ROOT | /var/www/vidmate |

---

## 2. "ssh: handshake failed" / "connection timed out"

**Fix:**

- Hostinger VPS must allow SSH (port 22).
- Use IP `147.93.108.231` in `VPS_HOST`, not the domain name.
- In Hostinger, check firewall allows SSH.

---

## 3. "ssh: unable to authenticate" / "permission denied"

**Fix for VPS_SSH_KEY:**

1. Open **Notepad**
2. File → Open → `C:\Users\ashok\.ssh\vidmate_deploy` (select "All files")
3. Copy **everything** from `-----BEGIN` to `-----END`
4. GitHub secret **VPS_SSH_KEY** → paste → Save
5. On VPS, public key must be in `/root/.ssh/authorized_keys` (from `vidmate_deploy.pub`)

Test on PC:

```cmd
ssh -i %USERPROFILE%\.ssh\vidmate_deploy root@147.93.108.231
```

If this fails, GitHub will fail too.

---

## 4. Build step failed (npm / vite)

Send the error line from the **Build** step. Usually fixed by re-running after a repo update.

---

## 5. Upload missing: dist.tar.gz

Re-run workflow after the latest `deploy.yml` fix (creates `/tmp/vidmate-deploy` first).

---

## Re-run deploy

Actions → **Deploy to VPS** → **Run workflow**
