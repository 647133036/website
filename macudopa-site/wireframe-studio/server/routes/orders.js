const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { requireAuth, requireRole } = require('../config/middleware');
const { charge, activeMethod, refund: pspRefund } = require('../config/payment');

const router = express.Router();

function oOut(r) {
  let items = []; let payment = {};
  try { items = JSON.parse(r.line_items_json || '[]'); } catch (e) { /* noop */ }
  try { payment = JSON.parse(r.payment_json || '{}'); } catch (e) { /* noop */ }
  return {
    id: r.id, ref: r.ref, userId: r.user_id, status: r.status,
    subtotal: r.subtotal, shipping: r.shipping, total: r.total,
    items, payment, createdAt: r.created_at
  };
}

// Place an order. body: { items:[{slug,variant,qty}], payment:{method,last4} }
router.post('/', requireAuth, async (req, res) => {
  const { items, payment } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'items required' });
  const lines = [];
  let subtotal = 0;
  for (const it of items) {
    const p = db.prepare('SELECT * FROM products WHERE slug = ?').get(it.slug);
    if (!p) return res.status(404).json({ error: `Product ${it.slug} not found` });
    if (p.stock < it.qty) return res.status(409).json({ error: `Insufficient stock for ${p.name}` });
    let variants = [];
    try { variants = JSON.parse(p.variants_json || '[]'); } catch (e) { /* noop */ }
    const variant = variants.find((v) => v.id === it.variant);
    const unit = p.price + (variant ? variant.delta : 0);
    lines.push({
      slug: p.slug, name: p.name, tone: p.tone, variant: it.variant,
      variantLabel: variant ? variant.label : null, unitPrice: +unit.toFixed(2), qty: it.qty
    });
    subtotal += unit * it.qty;
  }
  subtotal = +subtotal.toFixed(2);
  const shipping = subtotal >= 50 ? 0 : 4.95;
  const total = +(subtotal + shipping).toFixed(2);

  const ref = 'MCP-' + crypto.randomBytes(4).toString('hex').toUpperCase();

  // Charge through the active gateway. ctx carries amount + identifiers so a real
  // PSP (Stripe) can create a PaymentIntent; mock approves locally.
  const pResult = await charge(payment, { totalCents: Math.round(total * 100), ref, userId: req.user.id });

  if (!pResult.approved) {
    return res.status(402).json({ error: pResult.error || 'Payment declined.' });
  }

  // decrement stock + insert order atomically
  const tx = db.transaction(() => {
    for (const l of lines) {
      db.prepare('UPDATE products SET stock = stock - ? WHERE slug = ?').run(l.qty, l.slug);
    }
    const info = db.prepare(`
      INSERT INTO orders (ref, user_id, status, subtotal, shipping, total, line_items_json, payment_json)
      VALUES (?, ?, 'paid', ?, ?, ?, ?, ?)
    `).run(ref, req.user.id, subtotal, shipping, total, JSON.stringify(lines), JSON.stringify({
      method: pResult.method, approved: true, last4: pResult.last4,
      provider: pResult.provider, externalId: pResult.externalId || null,
      intentStatus: pResult.intent ? pResult.intent.status : null
    }));
    return info.lastInsertRowid;
  });
  const orderId = tx();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  res.status(201).json({ ok: true, order: oOut(order) });
});

// List: admin sees all, user sees own
router.get('/', requireAuth, (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const rows = isAdmin
    ? db.prepare('SELECT * FROM orders ORDER BY id DESC').all()
    : db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC').all(req.user.id);
  res.json(rows.map(oOut));
});

// Mine: current user's own orders only (works for every role, incl. admin)
router.get('/mine', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC').all(req.user.id);
  res.json(rows.map(oOut));
});

router.get('/stats', requireAuth, requireRole('admin'), (req, res) => {
  const s = db.prepare("SELECT COUNT(*) AS orders, COALESCE(SUM(total),0) AS revenue, COALESCE(SUM(subtotal),0) AS subtotal FROM orders WHERE status = 'paid'").get();
  const recent = db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 8').all().map(oOut);
  res.json({ orders: s.orders, revenue: s.revenue, recent });
});

// Active payment provider + config state (public; safe: no secrets).
router.get('/payment', (req, res) => {
  res.json({ provider: activeMethod(), configured: activeMethod() === 'mock' || true });
});

// Admin: refund an order through the active PSP (reserved; no-op-safe on mock).
router.post('/:ref/refund', requireAuth, requireRole('admin'), async (req, res) => {
  const r = db.prepare('SELECT * FROM orders WHERE ref = ?').get(req.params.ref);
  if (!r) return res.status(404).json({ error: 'Order not found' });
  let payment = {};
  try { payment = JSON.parse(r.payment_json || '{}'); } catch (e) { /* noop */ }
  if (payment.provider === 'mock' || !payment.externalId) {
    db.prepare("UPDATE orders SET status = 'refunded' WHERE ref = ?").run(req.params.ref);
    return res.json({ ok: true, provider: 'mock', note: 'Mock order marked refunded.' });
  }
  const out = await pspRefund({ externalId: payment.externalId, provider: payment.provider }, Math.round(r.total * 100));
  db.prepare("UPDATE orders SET status = 'refunded' WHERE ref = ?").run(req.params.ref);
  res.json({ ok: true, provider: payment.provider, psp: out ? out.id : null });
});

router.get('/:ref', requireAuth, (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const r = db.prepare('SELECT * FROM orders WHERE ref = ?').get(req.params.ref);
  if (!r) return res.status(404).json({ error: 'Order not found' });
  if (!isAdmin && r.user_id !== req.user.id) return res.status(403).json({ error: 'Not your order' });
  res.json(oOut(r));
});

module.exports = router;
