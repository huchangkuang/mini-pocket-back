/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: 'mini-pocket-api',
      cwd: './apps/api',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3035,
      },
    },
  ],
};
