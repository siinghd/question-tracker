module.exports = {
  apps: [
    {
      name: 'qat_prod_frontend', // Name of the TypeScript application
      script: 'pnpm', // Script to be executed
      args: 'start', // 'start' for running in production mode
      watch: true, // Enable watching of file changes (set to false in production)
      env: {
        NODE_ENV: 'production', // Set NODE_ENV for production
        PORT: 4001, // Application's port
      },
      // exec_mode: 'cluster', // Enable cluster mode for load balancing
      // instances: 'max', // Use 'max' to utilize all available cores
      autorestart: true, // Automatically restart if the app crashes
      max_memory_restart: '2G', // Restart if memory limit is reached
    },
  ],
};
