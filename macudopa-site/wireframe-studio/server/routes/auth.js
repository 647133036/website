const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { hashPassword, verifyPassword, signTokens, REFRESH_SECRET } = require('../config/auth');
const { requireAuth } = require('../config/middleware');

const router = express.Router();

function publicUser(u) {
  return { id: u.id, email: u.email, name: u.name, role: u.role, group: u.group_name, groupId: u.group_id };
}

router.post('/register', (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) return res.status(400).json({ error: 'email, password and name required' });
  if (password.length < 6) return res.status(400).json({ error: 'password must be at least 6 characters' });
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(409).json({ error: 'Email already registered' });
  const viewers = db.prepare("SELECT id FROM user_groups WHERE role = 'viewer'").get();
  const groupId = viewers ? viewers.id : null;
  const info = db.prepare('INSERT INTO users (email, password_hash, name, group_id) VALUES (?, ?, ?, ?)')
    .run(email, hashPassword(password), name, groupId);
  const user = db.prepare('SELECT u.*, g.name AS group_name, g.role AS role FROM users u LEFT JOIN user_groups g ON g.id=u.group_id WHERE u.id=?').get(info.lastInsertRowid);
  user.role = user.role || 'viewer';
  res.status(201).json({ user: publicUser(user), ...signTokens(user) });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = db.prepare('SELECT u.*, g.name AS group_name, g.role AS role FROM users u LEFT JOIN user_groups g ON g.id=u.group_id WHERE u.email=?').get(email || '');
  if (!user || !verifyPassword(password || '', user.password_hash)) return res.status(401).json({ error: 'Invalid credentials' });
  user.role = user.role || 'viewer';
  res.json({ user: publicUser(user), ...signTokens(user) });
});

router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    if (payload.typ !== 'refresh') throw new Error('bad-type');
    const user = db.prepare('SELECT u.*, g.name AS group_name, g.role AS role FROM users u LEFT JOIN user_groups g ON g.id=u.group_id WHERE u.id=?').get(payload.sub);
    if (!user) return res.status(401).json({ error: 'User no longer exists' });
    user.role = user.role || 'viewer';
    res.json(signTokens(user));
  } catch (e) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = router;
