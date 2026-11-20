const express = require('express');
const db = require('../db');
const { requireRole } = require('../config/middleware');

const router = express.Router();

function parseProps(json) {
  try { return JSON.parse(json || '{}'); } catch (e) { return {}; }
}
function blockOut(row) {
  return {
    id: row.id, page: row.page_slug, frame: row.frame, section: row.section_name,
    label: row.label, visible: !!row.visible, order: row.order_idx, props: parseProps(row.props_json),
    createdAt: row.created_at
  };
}

// List pages
router.get('/', (req, res) => {
  const pages = db.prepare('SELECT * FROM wireframe_pages ORDER BY title').all();
  const counts = db.prepare('SELECT page_slug, COUNT(*) AS n FROM wireframe_blocks GROUP BY page_slug').all();
  const cmap = Object.fromEntries(counts.map((c) => [c.page_slug, c.n]));
  res.json(pages.map((p) => ({ ...p, blockCount: cmap[p.slug] || 0 })));
});

// One page with both frames
router.get('/:slug', (req, res) => {
  const page = db.prepare('SELECT * FROM wireframe_pages WHERE slug = ?').get(req.params.slug);
  if (!page) return res.status(404).json({ error: 'Page not found' });
  const blocks = db.prepare('SELECT * FROM wireframe_blocks WHERE page_slug = ? ORDER BY frame, order_idx').all(req.params.slug);
  const frames = {
    '390': blocks.filter((b) => b.frame === '390').map(blockOut),
    '1440': blocks.filter((b) => b.frame === '1440').map(blockOut)
  };
  res.json({ ...page, frames });
});

// Create page (admin)
router.post('/', requireRole('admin'), (req, res) => {
  const { slug, title, description } = req.body || {};
  if (!slug || !title) return res.status(400).json({ error: 'slug and title required' });
  const s = slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  try {
    db.prepare('INSERT INTO wireframe_pages (slug, title, description) VALUES (?, ?, ?)').run(s, title, description || '');
    res.status(201).json({ slug: s, title, description: description || '' });
  } catch (e) {
    res.status(409).json({ error: 'Page slug already exists' });
  }
});

// Delete page (admin)
router.delete('/:slug', requireRole('admin'), (req, res) => {
  const p = db.prepare('SELECT id FROM wireframe_pages WHERE slug = ?').get(req.params.slug);
  if (!p) return res.status(404).json({ error: 'Page not found' });
  db.prepare('DELETE FROM wireframe_blocks WHERE page_slug = ?').run(req.params.slug);
  db.prepare('DELETE FROM wireframe_pages WHERE slug = ?').run(req.params.slug);
  res.json({ ok: true });
});

// ---- blocks (editor+) ----
function ensurePage(slug) {
  return db.prepare('SELECT * FROM wireframe_pages WHERE slug = ?').get(slug);
}

// Add block
router.post('/:slug/blocks', requireRole('editor'), (req, res) => {
  const page = ensurePage(req.params.slug);
  if (!page) return res.status(404).json({ error: 'Page not found' });
  const { frame = '1440', section, label, props } = req.body || {};
  if (!['390', '1440'].includes(frame)) return res.status(400).json({ error: "frame must be '390' or '1440'" });
  if (!section) return res.status(400).json({ error: 'section name required' });
  const maxOrder = db.prepare('SELECT COALESCE(MAX(order_idx),0) AS m FROM wireframe_blocks WHERE page_slug=? AND frame=?').get(req.params.slug, frame);
  const info = db.prepare(`
    INSERT INTO wireframe_blocks (page_slug, frame, section_name, label, visible, order_idx, props_json)
    VALUES (?, ?, ?, ?, 1, ?, ?)
  `).run(req.params.slug, frame, section, label || section, maxOrder.m + 1, JSON.stringify(props || {}));
  const row = db.prepare('SELECT * FROM wireframe_blocks WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(blockOut(row));
});

// Update block
router.put('/:slug/blocks/:blockId', requireRole('editor'), (req, res) => {
  const row = db.prepare('SELECT * FROM wireframe_blocks WHERE id = ?').get(req.params.blockId);
  if (!row) return res.status(404).json({ error: 'Block not found' });
  const { label, visible, order, props, section } = req.body || {};
  db.prepare(`
    UPDATE wireframe_blocks SET label = COALESCE(?, label), visible = COALESCE(?, visible), order_idx = COALESCE(?, order_idx), section_name = COALESCE(?, section_name), props_json = ?
    WHERE id = ?
  `).run(
    label === undefined ? null : label,
    visible === undefined ? null : (visible ? 1 : 0),
    order === undefined ? null : order,
    section === undefined ? null : section,
    JSON.stringify(props === undefined ? parseProps(row.props_json) : props),
    req.params.blockId
  );
  res.json(blockOut(db.prepare('SELECT * FROM wireframe_blocks WHERE id = ?').get(req.params.blockId)));
});

// Reorder a frame's blocks: body = [blockId, ...]
router.put('/:slug/reorder', requireRole('editor'), (req, res) => {
  const { frame, order } = req.body || {};
  if (!['390', '1440'].includes(frame) || !Array.isArray(order)) return res.status(400).json({ error: "frame and order[] required" });
  const tx = db.transaction(() => {
    order.forEach((id, i) => {
      db.prepare('UPDATE wireframe_blocks SET order_idx = ? WHERE id = ? AND page_slug = ?').run(i, id, req.params.slug);
    });
  });
  tx();
  res.json({ ok: true });
});

// Toggle visibility quickly
router.patch('/:slug/blocks/:blockId/visibility', requireRole('editor'), (req, res) => {
  const row = db.prepare('SELECT id, visible FROM wireframe_blocks WHERE id = ?').get(req.params.blockId);
  if (!row) return res.status(404).json({ error: 'Block not found' });
  db.prepare('UPDATE wireframe_blocks SET visible = ? WHERE id = ?').run(row.visible ? 0 : 1, req.params.blockId);
  res.json(blockOut(db.prepare('SELECT * FROM wireframe_blocks WHERE id = ?').get(req.params.blockId)));
});

// Delete block (editor+)
router.delete('/:slug/blocks/:blockId', requireRole('editor'), (req, res) => {
  const row = db.prepare('SELECT id FROM wireframe_blocks WHERE id = ?').get(req.params.blockId);
  if (!row) return res.status(404).json({ error: 'Block not found' });
  db.prepare('DELETE FROM wireframe_blocks WHERE id = ?').run(req.params.blockId);
  res.json({ ok: true });
});

module.exports = router;
