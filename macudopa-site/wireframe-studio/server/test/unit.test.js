const test = require('node:test');
const assert = require('node:assert/strict');
const { charge, activeMethod, GATEWAYS } = require('../config/payment.js');

test('activeMethod 默认 mock，未知方法回退 mock', () => {
  delete process.env.PAYMENT_METHOD;
  assert.equal(activeMethod(), 'mock');
  process.env.PAYMENT_METHOD = 'nope';
  assert.equal(activeMethod(), 'mock');
  process.env.PAYMENT_METHOD = 'stripe';
  assert.equal(activeMethod(), 'stripe');
  process.env.PAYMENT_METHOD = 'mock';
});

test('charge：mock 默认卡号通过，返回 method/approved/last4', async () => {
  process.env.PAYMENT_METHOD = 'mock';
  const r = await charge({ last4: '4242' }, { totalCents: 10000, ref: 'TEST-1', userId: 1 });
  assert.equal(r.approved, true);
  assert.equal(r.provider, 'mock');
  assert.equal(r.method, 'mock');
  assert.equal(r.last4, '4242');
  assert.equal(r.error, null);
});

test('charge：mock 下 last4=0000 被拒（never fails open）', async () => {
  process.env.PAYMENT_METHOD = 'mock';
  const r = await charge({ last4: '0000' }, { totalCents: 100, ref: 'TEST-2', userId: 1 });
  assert.equal(r.approved, false);
  assert.match(r.error, /declined/i);
});

test('charge：未配置 PSP 时明确报缺失（不静默通过）', async () => {
  delete process.env.STRIPE_SECRET_KEY;
  process.env.PAYMENT_METHOD = 'stripe';
  const r = await charge({ last4: '4242' }, { totalCents: 100, ref: 'TEST-3', userId: 1 });
  assert.equal(r.approved, false);
  assert.match(r.error, /not configured/i);
  process.env.PAYMENT_METHOD = 'mock';
});

test('GATEWAYS 含 mock/stripe/paypal 三个实现', () => {
  assert.deepEqual(Object.keys(GATEWAYS).sort(), ['mock', 'paypal', 'stripe']);
});
