const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/graphql',
    createProxyMiddleware({
      target: 'http://localhost:4000',
      changeOrigin: true,
    })
  );
  
  app.use(
    '/download',
    createProxyMiddleware({
      target: 'http://localhost:4000',
      changeOrigin: true,
    })
  );

  // For localhost env, simulate the config
  app.use(
    '/appconfig',
    (req, res) => {
      res.json({})
    }
  );
};