const test = require('node:test');
const assert = require('node:assert/strict');
const { freshApp, call } = require('./fixture.js');

// Fresh isolated app + temp DB for the whole integration suite.
const { app } = freshApp();

async function token(email, password) {
  const r = await call(app, '/auth/login', { method: 'POST', body: { email, password } });
  assert.equal(r.status, 200, `login ${email} 应 200，实际 ${r.status}`);
  return r.data.accessToken;
}

test('GET /api/health 匿名可访问', async () => {
  const r = await call(app, '/health');
  assert.equal(r.status, 200);
  assert.equal(r.data.ok, true);
});

test('auth：正确登录返回 token + 用户角色', async () => {
  const r = await call(app, '/auth/login', { method: 'POST', body: { email: 'admin@macudopa.com', password: 'admin123' } });
  assert.equal(r.status, 200);
  assert.ok(r.data.accessToken);
  assert.equal(r.data.user.role, 'admin');
});

test('auth：错误密码 401', async () => {
  const r = await call(app, '/auth/login', { method: 'POST', body: { email: 'admin@macudopa.com', password: 'wrong' } });
  assert.equal(r.status, 401);
});

test('auth：匿名访问需登录端点 401', async () => {
  const r = await call(app, '/users');
  assert.equal(r.status, 401);
});

test('RBAC：viewer 读 wireframes 200，写 403', async () => {
  const v = await token('view@macudopa.com', 'view123');
  assert.equal((await call(app, '/wireframes', { token: v })).status, 200);
  assert.equal((await call(app, '/wireframes', { method: 'POST', body: { slug: 'x', title: 'x' }, token: v })).status, 403);
});

test('RBAC：editor 可编辑 block，建用户 403', async () => {
  const e = await token('design@macudopa.com', 'design123');
  const p = await call(app, '/wireframes/product', { token: e });
  assert.equal(p.status, 200);
  const blk = p.data.frames['390'][0];
  const upd = await call(app, `/wireframes/product/blocks/${blk.id}`, { method: 'PUT', body: { visible: false }, token: e });
  assert.equal(upd.status, 200);
  assert.equal(upd.data.visible, false);
  assert.equal((await call(app, '/users', { method: 'POST', body: { email: 'z@z.com', password: 'p', name: 'z', groupId: 1 }, token: e })).status, 403);
});

test('wireframes：admin 建页/建 block/重排/删页全链路', async () => {
  const a = await token('admin@macudopa.com', 'admin123');
  const np = await call(app, '/wireframes', { method: 'POST', body: { slug: 'itest', title: 'IT Page' }, token: a });
  assert.equal(np.status, 201);
  assert.equal(np.data.slug, 'itest');
  const b1 = await call(app, '/wireframes/itest/blocks', { method: 'POST', body: { frame: '390', section: 'hero', label: 'H' }, token: a });
  assert.equal(b1.status, 201);
  const b2 = await call(app, '/wireframes/itest/blocks', { method: 'POST', body: { frame: '390', section: 'footer', label: 'F' }, token: a });
  assert.equal(b1.data.id, Math.min(b1.data.id, b2.data.id));
  const re = await call(app, '/wireframes/itest/reorder', { method: 'PUT', body: { frame: '390', order: [b2.data.id, b1.data.id] }, token: a });
  assert.equal(re.status, 200);
  const after = await call(app, '/wireframes/itest', { token: a });
  assert.deepEqual(after.data.frames['390'].map((x) => x.id), [b2.data.id, b1.data.id]);
  assert.equal((await call(app, '/wireframes/itest', { method: 'DELETE', token: a })).status, 200);
});

test('products：匿名可读（返回数组），admin 可写', async () => {
  const list = await call(app, '/products');
  assert.equal(list.status, 200);
  assert.ok(Array.isArray(list.data));
  const a = await token('admin@macudopa.com', 'admin123');
  const np = await call(app, '/products', { method: 'POST', body: { slug: 'itest-prod', name: 'IT', price: 9.99 }, token: a });
  assert.equal(np.status, 201);
});

test('orders：下单扣库存 + 拒付不落单', async () => {
  const a = await token('admin@macudopa.com', 'admin123');
  const prods = await call(app, '/products', { token: a });
  const p = prods.data[0];
  const before = p.stock;
  const ok = await call(app, '/orders', { method: 'POST', body: { items: [{ slug: p.slug, qty: 1 }], payment: { last4: '4242' } }, token: a });
  assert.equal(ok.status, 201);
  assert.equal(ok.data.order.status, 'paid');
  const afterProds = await call(app, '/products');
  const after = afterProds.data.find((x) => x.id === p.id);
  assert.equal(after.stock, before - 1);

  const bad = await call(app, '/orders', { method: 'POST', body: { items: [{ slug: p.slug, qty: 1 }], payment: { last4: '0000' } }, token: a });
  assert.equal(bad.status, 402);
});

test('orders/mine：返回数组且只含当前用户订单', async () => {
  const a = await token('admin@macudopa.com', 'admin123');
  const r = await call(app, '/orders/mine', { token: a });
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.data));
  for (const o of r.data) assert.equal(o.user_id, r.data[0].user_id);
});

test('data：admin 导出 CSV + 导入；viewer 403', async () => {
  const a = await token('admin@macudopa.com', 'admin123');
  const exp = await call(app, '/data/export?datasets=products&format=csv', { token: a });
  assert.equal(exp.status, 200);
  assert.match(exp.res.headers['content-type'], /csv/);
  const v = await token('view@macudopa.com', 'view123');
  assert.equal((await call(app, '/data/export?datasets=products', { token: v })).status, 403);
  assert.equal((await call(app, '/data/import', { method: 'POST', body: 'x', token: v })).status, 403);
});
