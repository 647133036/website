const express = require('express');
const cors = require('cors');

function createApp() {
  require('./db');
  const app = express();
  app.disable('x-powered-by');
  // Lock down CORS when CORS_ORIGINS is set (comma-separated allowlist); fall back
  // to allow-any for dev/preview where the gateway host varies.
  const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean) : null;
  app.use(cors(corsOrigins ? { origin: corsOrigins, credentials: true } : { origin: true, credentials: true }));

  // Accept both JSON and URL-encoded bodies (URL-encoded keeps browser requests
  // "simple" so the preview gateway doesn't drop their bodies / force a preflight).
  // Explicit body caps guard against oversized-payload memory DoS; data import
  // may carry larger nested JSON so it gets a higher limit than the rest.
  const isProd = process.env.NODE_ENV === 'production';
  app.use(express.json({ type: ['application/json', 'text/plain'], limit: isProd ? '2mb' : '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: isProd ? '1mb' : '5mb' }));

  app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api', require('./routes/users'));
  app.use('/api/wireframes', require('./routes/wireframes'));
  app.use('/api/products', require('./routes/products'));
  app.use('/api/orders', require('./routes/orders'));
  app.use('/api/data', require('./routes/data'));

  app.use((req, res) => res.status(404).json({ error: 'Not found' }));
  app.use((err, req, res, next) => {
    if (err && err.type === 'entity.too.large') return res.status(413).json({ error: 'Payload too large' });
    if (err && (err.type === 'entity.parse.failed' || err instanceof SyntaxError)) return res.status(400).json({ error: 'Invalid request body' });
    if (!err.status || err.status >= 500) {
      if (process.env.NODE_ENV === 'production') {
        console.error(err);
        return res.status(500).json({ error: 'Internal error' });
      }
    }
    res.status(err.status || 500).json({ error: err.message || 'Internal error' });
  });

  return app;
}

module.exports = createApp;

if (require.main === module) {
  const app = createApp();
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`MacuDopa Wireframe Studio API on http://localhost:${PORT}`);
  });
}
