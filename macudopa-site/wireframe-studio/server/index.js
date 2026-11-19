require('./db');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true, credentials: true }));

// Accept both JSON and URL-encoded bodies (URL-encoded keeps browser requests
// "simple" so the preview gateway doesn't drop their bodies / force a preflight).
app.use(express.json({ type: ['application/json', 'text/plain'] }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/users'));
app.use('/api/wireframes', require('./routes/wireframes'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message || 'Internal error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`MacuDopa Wireframe Studio API on http://localhost:${PORT}`);
});
