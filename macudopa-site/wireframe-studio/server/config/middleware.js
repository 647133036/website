const jwt = require('jsonwebtoken');
const db = require('../db');
const { ACCESS_SECRET } = require('../config/auth');

function attachUser(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return next(new Error('no-token'));
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    const user = db.prepare('SELECT u.*, g.name AS group_name, g.role AS group_role FROM users u LEFT JOIN user_groups g ON g.id = u.group_id WHERE u.id = ?').get(payload.sub);
    if (!user) return next(new Error('user-gone'));
    user.role = user.group_role || user.role || 'viewer';
    req.user = user;
    return next();
  } catch (e) {
    return next(new Error('bad-token'));
  }
}

function requireAuth(req, res, next) {
  attachUser(req, res, (err) => {
    if (err) return res.status(401).json({ error: err.message === 'no-token' ? 'Authentication required' : 'Invalid or expired token' });
    next();
  });
}

const ROLE_RANK = { viewer: 1, editor: 2, admin: 3 };
function requireRole(minRole) {
  return (req, res, next) => {
    attachUser(req, res, (err) => {
      if (err) return res.status(401).json({ error: err.message === 'no-token' ? 'Authentication required' : 'Invalid or expired token' });
      const have = ROLE_RANK[req.user.role] || 0;
      const need = ROLE_RANK[minRole] || 1;
      if (have < need) return res.status(403).json({ error: `Requires ${minRole} role` });
      next();
    });
  };
}

module.exports = { requireAuth, requireRole, ROLE_RANK };
