const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../config/middleware');

const router = express.Router();

function pOut(r) {
  let variants = [];
  try { variants = JSON.parse(r.variants_json || '[]'); } catch (e) { /* noop */ }
  return {
    id: r.id, slug: r.slug, name: r.name, price: r.price, comparePrice: r.compare_price,
    category: r.category, tone: r.tone, formula: r.formula, meta: r.meta,
    badge: r.badge, description: r.description, stock: r.stock, active: !!r.active,
    variants
  };
}

// Public: list active products
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY name').all();
  const q = (req.query.q || '').toLowerCase();
  const cat = req.query.category;
  let out = rows.map(pOut);
  if (cat) out = out.filter((p) => p.category === cat);
  if (q) out = out.filter((p) => p.name.toLowerCase().includes(q) || p.meta.toLowerCase().includes(q));
  res.json(out);
});

// Public: one product by slug
router.get('/:slug', (req, res) => {
  const r = db.prepare('SELECT * FROM products WHERE slug = ?').get(req.params.slug);
  if (!r) return res.status(404).json({ error: 'Product not found' });
  res.json(pOut(r));
});

// Admin: create
router.post('/', requireAuth, requireRole('admin'), (req, res) => {
  const b = req.body || {};
  if (!b.slug || !b.name || b.price == null) return res.status(400).json({ error: 'slug, name and price required' });
  try {
    const info = db.prepare(`
      INSERT INTO products (slug, name, price, compare_price, category, tone, formula, meta, badge, description, stock, active, variants_json)
      VALUES (@slug, @name, @price, @compare_price, @category, @tone, @formula, @meta, @badge, @description, @stock, @active, @variants_json)
    `).run({
      slug: String(b.slug).trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
      name: b.name, price: Number(b.price), compare_price: b.compare_price == null ? null : Number(b.compare_price),
      category: b.category || '', tone: b.tone || 'orange', formula: b.formula || '', meta: b.meta || '',
      badge: b.badge || null, description: b.description || '', stock: Number(b.stock || 100),
      active: b.active ? 1 : 0, variants_json: JSON.stringify(b.variants || [])
    });
    res.status(201).json(pOut(db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid)));
  } catch (e) {
    res.status(409).json({ error: 'Product slug already exists' });
  }
});

// Admin: update
router.put('/:slug', requireAuth, requireRole('admin'), (req, res) => {
  const r = db.prepare('SELECT * FROM products WHERE slug = ?').get(req.params.slug);
  if (!r) return res.status(404).json({ error: 'Product not found' });
  const b = req.body || {};
  db.prepare(`
    UPDATE products SET
      name = COALESCE(?, name), price = COALESCE(?, price), compare_price = COALESCE(?, compare_price),
      category = COALESCE(?, category), tone = COALESCE(?, tone), formula = COALESCE(?, formula),
      meta = COALESCE(?, meta), badge = ?, description = COALESCE(?, description),
      stock = COALESCE(?, stock), active = COALESCE(?, active), variants_json = ?
    WHERE slug = ?
  `).run(
    b.name ?? null, b.price ?? null, b.compare_price === undefined ? null : b.compare_price,
    b.category ?? null, b.tone ?? null, b.formula ?? null, b.meta ?? null,
    b.badge === undefined ? null : b.badge, b.description ?? null,
    b.stock ?? null, b.active === undefined ? null : (b.active ? 1 : 0),
    b.variants === undefined ? r.variants_json : JSON.stringify(b.variants),
    req.params.slug
  );
  res.json(pOut(db.prepare('SELECT * FROM products WHERE slug = ?').get(req.params.slug)));
});

// Admin: delete
router.delete('/:slug', requireAuth, requireRole('admin'), (req, res) => {
  const r = db.prepare('SELECT id FROM products WHERE slug = ?').get(req.params.slug);
  if (!r) return res.status(404).json({ error: 'Product not found' });
  db.prepare('DELETE FROM products WHERE id = ?').run(r.id);
  res.json({ ok: true });
});

module.exports = router;
