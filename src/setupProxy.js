const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Proxies /__whapi/* → https://gate.whapi.cloud/* so the browser does not send
 * the Bearer token (avoids some CORS/preflight edge cases; token stays in Node).
 * CRA loads .env* into process.env when the dev server starts.
 */
module.exports = function setupWhapiProxy(app) {
  const token = (process.env.REACT_APP_WHAPI_TOKEN || '').trim();
  if (!token) return;

  app.use(
    '/__whapi',
    createProxyMiddleware({
      target: 'https://gate.whapi.cloud',
      changeOrigin: true,
      pathRewrite: { '^/__whapi': '' },
      onProxyReq(proxyReq) {
        proxyReq.setHeader('Authorization', `Bearer ${token}`);
      },
    })
  );
};
