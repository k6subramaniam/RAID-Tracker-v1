module.exports = {
  apps: [
    {
      name: 'pwa-server',
      script: './pwa-server.js',
      cwd: '/home/user/webapp',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      },
      error_file: './logs/pwa-error.log',
      out_file: './logs/pwa-out.log',
      log_file: './logs/pwa-combined.log',
      time: true
    },
    {
      name: 'ai-proxy',
      script: './ai-proxy-server.js',
      cwd: '/home/user/webapp',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/ai-proxy-error.log',
      out_file: './logs/ai-proxy-out.log',
      log_file: './logs/ai-proxy-combined.log',
      time: true
    }
  ]
};