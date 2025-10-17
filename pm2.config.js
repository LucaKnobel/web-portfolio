module.exports = {
  apps: [{
    name: 'web-portfolio',
    script: './dist/server/entry.mjs',
    instances: 1,
    exec_mode: 'cluster',
    
    // Application
    cwd: '/home/client/sites/lucaknobel.ch/app/current/web-portfolio',
    node_args: '--max-old-space-size=256',
    
    // Environment
    env: {
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      PORT: 8080
    },
    
    // Logs
    log_file: '/home/client/sites/lucaknobel.ch/app/logs/pm2-app.log',
    out_file: '/home/client/sites/lucaknobel.ch/app/logs/pm2-out.log',
    error_file: '/home/client/sites/lucaknobel.ch/app/logs/pm2-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Process management
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.git'],
    max_memory_restart: '200M',
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 8000,
    
    // Auto restart
    autorestart: true,
    max_restarts: 5,
    min_uptime: '10s',
    
    // Deployment
    restart_delay: 1000,
    
    // Health monitoring
    health_check_grace_period: 3000
  }]
};