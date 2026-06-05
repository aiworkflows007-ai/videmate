module.exports = {
  apps: [
    {
      name: 'vidmate-api',
      script: 'server/index.js',
      cwd: '/var/www/vidmate-api',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3017,
        YTDLP_PATH: '/usr/local/bin/yt-dlp',
        JOBS_DIR: '/var/www/vidmate-api/.data/jobs',
      },
    },
  ],
};
