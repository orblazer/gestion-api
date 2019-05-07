/* eslint-disable @typescript-eslint/camelcase */
module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    // First application
    {
      name: 'gestion-api',
      script: 'dist/index.js',
      autorestart: true,
      restart_delay: 4000,
      error_file: './logs/log.log',
      out_file: './logs/log.log',
      env_production: {
        NODE_ENV: 'production'
      },
      watch: 'dist'
      // ignore_watch: ["node_modules", "logs"]
    }
  ]
}
