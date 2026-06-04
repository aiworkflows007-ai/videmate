# Deploy checklist — ai-workflows.cloud

| Item | Value |
|------|--------|
| GitHub | https://github.com/aiworkflows007-ai/videmate |
| Subdomain | **vidmate.ai-workflows.cloud** |
| DNS A record | Name: `vidmate` → VPS IP |
| Production URL | https://vidmate.ai-workflows.cloud |

## GitHub Secrets (Settings → Actions)

```
VPS_HOST          = your Hostinger VPS IP
VPS_USER          = root (or your SSH user)
VPS_SSH_KEY       = private deploy key
VITE_SITE_URL     = https://vidmate.ai-workflows.cloud
VPS_WEB_ROOT      = /var/www/vidmate
```

## After first deploy

- https://vidmate.ai-workflows.cloud
- https://vidmate.ai-workflows.cloud/ads.txt
- Search Console sitemap: https://vidmate.ai-workflows.cloud/sitemap.xml
