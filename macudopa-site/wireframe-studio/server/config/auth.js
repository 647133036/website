const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Secrets must be provided in production; a hardcoded fallback would let anyone
// mint valid tokens, so refuse to start when NODE_ENV=production without them.
function requireSecret(name, fallback) {
  if (process.env[name]) return process.env[name];
  if (process.env.NODE_ENV === 'production') {
    console.error(`[auth] FATAL: ${name} must be set in production (no hardcoded fallback).`);
    process.exit(1);
  }
  return fallback;
}
const ACCESS_SECRET = requireSecret('ACCESS_SECRET', 'dev-access-secret-change-me');
const REFRESH_SECRET = requireSecret('REFRESH_SECRET', 'dev-refresh-secret-change-me');
const ACCESS_TTL = '15m';
const REFRESH_TTL = '7d';

function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(plain, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(plain, stored) {
  const [salt, hash] = stored.split(':');
  const test = crypto.scryptSync(plain, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(test, 'hex'));
}

function signTokens(user) {
  const payload = { sub: user.id, email: user.email, name: user.name, role: user.role, groupId: user.group_id };
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
  const refreshToken = jwt.sign({ sub: user.id, typ: 'refresh' }, REFRESH_SECRET, { expiresIn: REFRESH_TTL });
  return { accessToken, refreshToken };
}

module.exports = { hashPassword, verifyPassword, signTokens, ACCESS_SECRET, REFRESH_SECRET, REFRESH_TTL };
