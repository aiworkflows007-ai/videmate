# GitHub deploy fails but CMD SSH works

Your PC uses the key file. GitHub uses the **VPS_SSH_KEY** secret. They must be the **same private key**.

## Fix VPS_SSH_KEY (do this once)

1. CMD:

```cmd
notepad %USERPROFILE%\.ssh\vidmate_deploy
```

2. Ctrl+A → Ctrl+C (copy ALL lines including BEGIN and END)
3. https://github.com/aiworkflows007-ai/videmate/settings/secrets/actions
4. **VPS_SSH_KEY** → Update → paste → Update secret
5. Confirm **VPS_HOST** = `147.93.108.231` and **VPS_USER** = `root`

## Push new workflow (CMD)

```cmd
cd C:\Users\ashok\Downloads\vidmate
"C:\Program Files\Git\bin\git.exe" add .github/workflows/deploy.yml deploy/fix-github-ssh-secret.md
"C:\Program Files\Git\bin\git.exe" commit -m "Fix deploy: use ssh-agent for clearer SSH errors"
"C:\Program Files\Git\bin\git.exe" push origin main
```

## Run deploy

Actions → Deploy to VPS → Run workflow

If **Test SSH connection** fails → secret still wrong.
If **Upload** fails → send the red error text.
