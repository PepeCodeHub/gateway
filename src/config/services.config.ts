export const services = {
    auth: {
      url: '/api/auth',
      queue: 'auth.service',
      pathRewrite: {
        '^/api/auth': ''
      }
    },
};