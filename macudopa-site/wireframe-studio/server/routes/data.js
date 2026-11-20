const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { hashPassword } = require('../config/auth');
const { requireAuth, requireRole } = require('../config/middleware');

const router = express.Router();
router.use(requireAuth, requireRole('admin'));

const DATASETS = ['products', 'orders', 'wireframes', 'users'];

function pickDatasets(req) {
  const wanted = (req.query.datasets || '').split(',').map((s) => s.trim()).filter(Boolean);
  const list = wanted.length ? wanted.filter((d) => DATASETS.includes(d)) : DATASETS;
  return list.length ? list : DATASETS;
}

function exportProducts() {
  return db.prepare('SELECT * FROM products').all().map((r) => {
    let variants = []; let gallery = []; let detail = [];
    try { variants = JSON.parse(r.variants_json || '[]'); } catch (e) { /* noop */ }
    try { gallery = JSON.parse(r.gallery_json || '[]'); } catch (e) { /* noop */ }
    try { detail = JSON.parse(r.detail_json || '[]'); } catch (e) { /* noop */ }
    return {
      slug: r.slug, name: r.name, price: r.price, compare_price: r.compare_price,
      category: r.category, tone: r.tone, formula: r.formula, meta: r.meta,
      badge: r.badge, description: r.description, stock: r.stock, active: !!r.active,
      variants, gallery, detail
    };
  });
}

function exportOrders() {
  return db.prepare('SELECT * FROM orders').all().map((r) => {
    let items = []; let payment = {};
    try { items = JSON.parse(r.line_items_json || '[]'); } catch (e) { /* noop */ }
    try { payment = JSON.parse(r.payment_json || '{}'); } catch (e) { /* noop */ }
    return { ref: r.ref, userId: r.user_id, status: r.status, subtotal: r.subtotal, shipping: r.shipping, total: r.total, items, payment, createdAt: r.created_at };
  });
}

function exportWireframes() {
  const pages = db.prepare('SELECT * FROM wireframe_pages').all();
  return pages.map((p) => {
    const blocks = db.prepare('SELECT * FROM wireframe_blocks WHERE page_slug = ? ORDER BY frame, order_idx').all(p.slug);
    const frames = { '390': [], '1440': [] };
    for (const b of blocks) {
      let props = {};
      try { props = JSON.parse(b.props_json || '{}'); } catch (e) { /* noop */ }
      frames[b.frame].push({ section: b.section_name, label: b.label, visible: !!b.visible, order: b.order_idx, props });
    }
    return { slug: p.slug, title: p.title, description: p.description, frames };
  });
}

function exportUsers() {
  const groups = db.prepare('SELECT id, name, role, description FROM user_groups').all();
  const users = db.prepare('SELECT id, email, name, group_id FROM users').all().map((u) => ({ email: u.email, name: u.name, groupId: u.group_id }));
  return { groups, users };
}

function toCsv(rows, columns) {
  const esc = (v) => {
    if (v == null) return '';
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = columns.join(',');
  const lines = rows.map((r) => columns.map((c) => esc(r[c])).join(','));
  return [head, ...lines].join('\n');
}

router.get('/export', (req, res) => {
  const format = (req.query.format || 'json').toLowerCase();
  const datasets = pickDatasets(req);
  if (format === 'csv') {
    const csv = datasets.map((d) => {
      if (d === 'products') return `# products\n` + toCsv(exportProducts(), ['slug', 'name', 'price', 'compare_price', 'category', 'tone', 'formula', 'meta', 'badge', 'description', 'stock', 'active', 'variants', 'gallery', 'detail']);
      if (d === 'orders') return `# orders\n` + toCsv(exportOrders(), ['ref', 'userId', 'status', 'subtotal', 'shipping', 'total', 'items', 'payment', 'createdAt']);
      return `# ${d}: use format=json (not tabular)`;
    }).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="macudopa-${datasets.join('-')}-export.csv"`);
    return res.send(csv);
  }
  const out = { exportedAt: new Date().toISOString(), datasets: {} };
  for (const d of datasets) out.datasets[d] = d === 'products' ? exportProducts() : d === 'orders' ? exportOrders() : d === 'wireframes' ? exportWireframes() : exportUsers();
  res.setHeader('Content-Disposition', `attachment; filename="macudopa-export.json"`);
  res.json(out);
});

// ---- import ----
function importProducts(list) {
  let upserted = 0;
  for (const p of list) {
    if (!p || !p.slug || !p.name || p.price == null) continue;
    const s = String(p.slug).trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    const exists = db.prepare('SELECT id FROM products WHERE slug = ?').get(s);
    if (exists) {
      db.prepare(`UPDATE products SET name=?, price=?, compare_price=?, category=?, tone=?, formula=?, meta=?, badge=?, description=?, stock=?, active=?, variants_json=?, gallery_json=?, detail_json=? WHERE slug=?`)
        .run(p.name, Number(p.price), p.compare_price == null ? null : Number(p.compare_price),
          p.category || '', p.tone || 'orange', p.formula || '', p.meta || '', p.badge == null ? null : p.badge,
          p.description || '', Number(p.stock ?? 100), p.active === false ? 0 : 1,
          JSON.stringify(p.variants || []), JSON.stringify(p.gallery || []), JSON.stringify(p.detail || []), s);
    } else {
      db.prepare(`INSERT INTO products (slug,name,price,compare_price,category,tone,formula,meta,badge,description,stock,active,variants_json,gallery_json,detail_json)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .run(s, p.name, Number(p.price), p.compare_price == null ? null : Number(p.compare_price),
          p.category || '', p.tone || 'orange', p.formula || '', p.meta || '', p.badge == null ? null : p.badge,
          p.description || '', Number(p.stock ?? 100), p.active === false ? 0 : 1,
          JSON.stringify(p.variants || []), JSON.stringify(p.gallery || []), JSON.stringify(p.detail || []));
    }
    upserted++;
  }
  return upserted;
}

function importOrders(list) {
  let n = 0;
  for (const o of list) {
    if (!o || !o.ref) continue;
    db.prepare(`INSERT INTO orders (ref,user_id,status,subtotal,shipping,total,line_items_json,payment_json,created_at)
      VALUES (?,?,?,?,?,?,?,?,?)
      ON CONFLICT(ref) DO UPDATE SET status=excluded.status, subtotal=excluded.subtotal, total=excluded.total, line_items_json=excluded.line_items_json, payment_json=excluded.payment_json`)
      .run(o.ref, o.userId || null, o.status || 'paid', Number(o.subtotal || 0), Number(o.shipping || 0), Number(o.total || 0),
        JSON.stringify(o.items || []), JSON.stringify(o.payment || {}), o.createdAt || new Date().toISOString());
    n++;
  }
  return n;
}

function importWireframes(list) {
  let pages = 0; let blocks = 0;
  for (const pg of list) {
    if (!pg || !pg.slug) continue;
    db.prepare('INSERT INTO wireframe_pages (slug,title,description) VALUES (?,?,?) ON CONFLICT(slug) DO UPDATE SET title=excluded.title, description=excluded.description').run(pg.slug, pg.title || pg.slug, pg.description || '');
    pages++;
    for (const frame of ['390', '1440']) {
      const arr = (pg.frames && pg.frames[frame]) || [];
      if (!arr.length) continue;
      db.prepare('DELETE FROM wireframe_blocks WHERE page_slug = ? AND frame = ?').run(pg.slug, frame);
      arr.forEach((b, i) => {
        db.prepare(`INSERT INTO wireframe_blocks (page_slug, frame, section_name, label, visible, order_idx, props_json) VALUES (?,?,?,?,?,?,?)`)
          .run(pg.slug, frame, b.section || 'section', b.label || b.section || 'section', b.visible === false ? 0 : 1, b.order ?? i, JSON.stringify(b.props || {}));
        blocks++;
      });
    }
  }
  return { pages, blocks };
}

function importUsers(payload) {
  let groups = 0; let users = 0;
  for (const g of (payload.groups || [])) {
    if (!g || !g.name) continue;
    db.prepare(`INSERT INTO user_groups (name, role, description) VALUES (?,?,?) ON CONFLICT(name) DO UPDATE SET role=excluded.role, description=excluded.description`)
      .run(g.name, g.role || 'viewer', g.description || '');
    groups++;
  }
  const nameToId = Object.fromEntries(db.prepare('SELECT id, name FROM user_groups').all().map((g) => [g.name, g.id]));
  const created = [];
  for (const u of (payload.users || [])) {
    if (!u || !u.email) continue;
    const gid = u.groupId != null ? u.groupId : (u.group ? nameToId[u.group] : null);
    // 无显式口令时落一次性随机强口令并回传，避免弱默认密码被复用
    const password = u.password || crypto.randomBytes(8).toString('hex');
    db.prepare(`INSERT INTO users (email, password_hash, name, group_id) VALUES (?,?,?,?) ON CONFLICT(email) DO UPDATE SET name=excluded.name, group_id=excluded.group_id`)
      .run(u.email, hashPassword(password), u.name || u.email, gid || null);
    if (!u.password) created.push({ email: u.email, temporaryPassword: password });
    users++;
  }
  return { groups, users, created };
}

router.post('/import', (req, res) => {
  let body = req.body || {};
  if (typeof body.payload === 'string') {
    try { body = JSON.parse(body.payload); } catch (e) { return res.status(400).json({ error: 'payload is not valid JSON' }); }
  }
  const data = body.data && body.data.datasets ? body.data : body;
  const result = { ok: true, counts: {} };
  const overwrite = body.overwrite === true;
  try {
    let userImport = null;
    if (Array.isArray(data.products)) result.counts.products = importProducts(data.products);
    if (Array.isArray(data.orders)) result.counts.orders = importOrders(data.orders);
    if (Array.isArray(data.wireframes)) result.counts.wireframes = importWireframes(data.wireframes);
    if (data.users && Array.isArray(data.users.users)) userImport = importUsers(data.users);
    if (userImport) {
      result.counts.users = userImport.users;
      if (userImport.created && userImport.created.length) result.temporaryPasswords = userImport.created;
    }
    if (Object.keys(result.counts).length === 0) return res.status(400).json({ error: 'No recognizable dataset to import. Provide products / orders / wireframes / users.' });
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: 'Import failed: ' + e.message });
  }
});

module.exports = router;
