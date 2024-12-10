export const services = {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      queue: 'auth.service',
      pathRewrite: {
        '^/api/auth': ''
      }
    },
};