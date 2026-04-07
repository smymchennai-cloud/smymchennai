/**
 * Dev-only: same-origin proxy so GET/POST to the Bulandi web app avoid browser CORS to script.google.com.
 * Exec URL must match src/config/bulandiWebApp.json (single source of truth).
 */
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const { execUrl } = require(path.join(__dirname, 'config', 'bulandiWebApp.json'));
const EXEC_PATH = new URL(execUrl).pathname;

module.exports = function setupProxy(app) {
  app.use(
    '/bulandi-sheet-exec',
    createProxyMiddleware({
      target: 'https://script.google.com',
      changeOrigin: true,
      secure: true,
      pathRewrite: { '^/bulandi-sheet-exec': EXEC_PATH },
    })
  );
};
