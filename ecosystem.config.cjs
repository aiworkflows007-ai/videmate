module.exports = {
  apps: [
    {
      name: 'vidmate-api',
      script: 'server/index.js',
      cwd: '/var/www/vidmate-api',
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        JOBS_DIR: '/var/www/vidmate-api/.data/jobs',
      },
    },
  ],
};
