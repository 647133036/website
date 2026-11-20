const os = require('os');
const path = require('path');
const request = require('supertest');

function clearServerCache() {
  for (const key of Object.keys(require.cache)) {
    if (key.includes('/server/')) delete require.cache[key];
  }
}

// Point the app at a fresh temp DB, seed it, return a supertest-ready app.
function freshApp() {
  const file = path.join(os.tmpdir(), `macudopa-test-${process.pid}-${Date.now()}.db`);
  process.env.DB_PATH = file;
  process.env.PAYMENT_METHOD = 'mock';
  clearServerCache();
  require('../db');
  require('../db/seed.js');
  const createApp = require('../index.js');
  const app = createApp();
  return { app, file };
}

async function call(app, url, { method = 'GET', body, token, rawJson } = {}) {
  const path = url.startsWith('/api/') ? url : '/api' + url;
  let out = request(app)[method.toLowerCase()](path);
  if (token) out = out.set('Authorization', 'Bearer ' + token);
  if (body !== undefined) {
    if (rawJson && typeof body === 'string') out = out.set('Content-Type', 'application/json').send(body);
    else if (typeof body === 'string') out = out.send(body);
    else out = out.set('Content-Type', 'application/json').send(body);
  }
  const res = await out;
  let data = null;
  try { data = res.body; } catch (e) { /* text/csv export has no JSON body */ }
  return { status: res.status, data, res };
}

module.exports = { freshApp, call };
