const express = require('express');
const db = require('../db');
const { hashPassword } = require('../config/auth');
const { requireAuth, requireRole } = require('../config/middleware');

const router = express.Router();

function publicUser(u) {
  return {
    id: u.id, email: u.email, name: u.name, role: u.role,
    group: u.group_name, groupId: u.group_id, createdAt: u.created_at
  };
}

// ---- user groups ----
router.get('/groups', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT g.id, g.name, g.role, g.description, COUNT(u.id) AS members
    FROM user_groups g LEFT JOIN users u ON u.group_id = g.id
    GROUP BY g.id ORDER BY g.name
  `).all();
  res.json(rows);
});

router.post('/groups', requireRole('admin'), (req, res) => {
  const { name, role, description } = req.body || {};
  if (!name || !['admin', 'editor', 'viewer'].includes(role)) return res.status(400).json({ error: 'name and valid role required' });
  try {
    const info = db.prepare('INSERT INTO user_groups (name, role, description) VALUES (?, ?, ?)').run(name, role, description || '');
    res.status(201).json({ id: info.lastInsertRowid, name, role, description: description || '' });
  } catch (e) {
    res.status(409).json({ error: 'Group name already exists' });
  }
});

router.put('/groups/:id', requireRole('admin'), (req, res) => {
  const { name, role, description } = req.body || {};
  db.prepare('UPDATE user_groups SET name = COALESCE(?, name), role = COALESCE(?, role), description = COALESCE(?, description) WHERE id = ?')
    .run(name || null, role || null, description === undefined ? null : description, req.params.id);
  const g = db.prepare('SELECT id, name, role, description FROM user_groups WHERE id = ?').get(req.params.id);
  if (!g) return res.status(404).json({ error: 'Group not found' });
  res.json(g);
});

router.delete('/groups/:id', requireRole('admin'), (req, res) => {
  const g = db.prepare('SELECT id FROM user_groups WHERE id = ?').get(req.params.id);
  if (!g) return res.status(404).json({ error: 'Group not found' });
  db.prepare('UPDATE users SET group_id = NULL WHERE group_id = ?').run(req.params.id);
  db.prepare('DELETE FROM user_groups WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ---- users ----
router.get('/users', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT u.id, u.email, u.name, u.group_id, u.created_at, g.name AS group_name, g.role AS role
    FROM users u LEFT JOIN user_groups g ON g.id = u.group_id ORDER BY u.name
  `).all();
  res.json(rows.map(publicUser));
});

router.post('/users', requireRole('admin'), (req, res) => {
  const { email, password, name, groupId, role } = req.body || {};
  if (!email || !password || !name) return res.status(400).json({ error: 'email, password and name required' });
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(409).json({ error: 'Email already in use' });
  let gid = groupId;
  let gRole = role;
  if (groupId) {
    const g = db.prepare('SELECT id, role FROM user_groups WHERE id = ?').get(groupId);
    if (g) gRole = g.role;
  }
  const info = db.prepare('INSERT INTO users (email, password_hash, name, group_id) VALUES (?, ?, ?, ?)').run(email, hashPassword(password), name, gid || null);
  if (gid && gRole) {
    db.prepare('UPDATE user_groups SET role = ? WHERE id = ?').run(gRole, gid);
  }
  const user = db.prepare('SELECT u.*, g.name AS group_name, g.role AS role FROM users u LEFT JOIN user_groups g ON g.id=u.group_id WHERE u.id=?').get(info.lastInsertRowid);
  res.status(201).json(publicUser(user));
});

router.put('/users/:id', requireRole('admin'), (req, res) => {
  const { name, groupId } = req.body || {};
  const u = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!u) return res.status(404).json({ error: 'User not found' });
  db.prepare('UPDATE users SET name = COALESCE(?, name), group_id = ? WHERE id = ?')
    .run(name || null, groupId === undefined ? (db.prepare('SELECT group_id FROM users WHERE id=?').get(req.params.id).group_id) : (groupId || null), req.params.id);
  const user = db.prepare('SELECT u.*, g.name AS group_name, g.role AS role FROM users u LEFT JOIN user_groups g ON g.id=u.group_id WHERE u.id=?').get(req.params.id);
  res.json(publicUser(user));
});

router.delete('/users/:id', requireRole('admin'), (req, res) => {
  if (String(req.params.id) === String(req.user.id)) return res.status(400).json({ error: 'Cannot delete yourself' });
  const u = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!u) return res.status(404).json({ error: 'User not found' });
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
