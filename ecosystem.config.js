// PM2 ecosystem configuration
// Usage: pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'esports-backend',
      script: './backend/src/server.js',
      cwd: '/home/ubuntu/esports',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: '/home/ubuntu/esports/logs/backend-error.log',
      out_file: '/home/ubuntu/esports/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '5s',
    },
    {
      name: 'esports-frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/home/ubuntu/esports/frontend',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/home/ubuntu/esports/logs/frontend-error.log',
      out_file: '/home/ubuntu/esports/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
}
