const test = require('node:test');
const assert = require('node:assert/strict');
const { freshApp, call } = require('./fixture.js');

const { app } = freshApp();

// 端到端场景：匿名公开浏览 → 用户登录下单支付 → 我的订单 → 管理员退款 → 数据导出反映状态
test('系统闭环：公开访问 + 下单支付 + 退款 + 导出', async () => {
  // 1. 匿名公开：商品与线框页可读，无需登录
  const prods = await call(app, '/products');
  assert.equal(prods.status, 200);
  assert.ok(prods.data.length >= 4, '种子商品至少 4 个');
  const wf = await call(app, '/wireframes');
  assert.equal(wf.status, 200);
  assert.ok(Array.isArray(wf.data));

  // 2. 普通用户登录
  const login = await call(app, '/auth/login', { method: 'POST', body: { email: 'design@macudopa.com', password: 'design123' } });
  assert.equal(login.status, 200);
  const token = login.data.accessToken;

  const p = prods.data[0];
  const stockBefore = p.stock;

  // 3. 下单并支付
  const order = await call(app, '/orders', { method: 'POST', body: { items: [{ slug: p.slug, qty: 2 }], payment: { last4: '4242' } }, token });
  assert.equal(order.status, 201);
  const ref = order.data.order.ref;
  assert.ok(ref);
  assert.equal(order.data.order.status, 'paid');

  // 4. 库存扣减
  const afterOrder = (await call(app, '/products')).data.find((x) => x.id === p.id);
  assert.equal(afterOrder.stock, stockBefore - 2, '下单后库存应减 2');

  // 5. 我的订单里能看到这笔
  const mine = await call(app, '/orders/mine', { token });
  assert.ok(mine.data.some((o) => o.ref === ref), 'my-orders 应包含刚下的订单');

  // 6. 管理员退款
  const adminLogin = await call(app, '/auth/login', { method: 'POST', body: { email: 'admin@macudopa.com', password: 'admin123' } });
  const admin = adminLogin.data.accessToken;
  const refund = await call(app, `/orders/${ref}/refund`, { method: 'POST', token: admin });
  assert.equal(refund.status, 200);
  const ordNow = await call(app, `/orders/${ref}`, { token: admin });
  assert.equal(ordNow.data.status, 'refunded');

  // 7. 普通用户无权退款（RBAC 在系统层面生效）
  const userRefund = await call(app, `/orders/${ref}/refund`, { method: 'POST', token });
  assert.equal(userRefund.status, 403);

  // 8. 导出订单，确认该订单状态被记录
  const exp = await call(app, '/data/export?datasets=orders&format=json', { token: admin });
  assert.equal(exp.status, 200);
  const orders = exp.data.datasets.orders;
  assert.ok(Array.isArray(orders));
  const found = orders.find((o) => o.ref === ref);
  assert.ok(found, '导出结果应包含该订单');
  assert.equal(found.status, 'refunded');
});

test('系统：匿名不能访问管理端点（公开只读边界）', async () => {
  assert.equal((await call(app, '/users')).status, 401);
  assert.equal((await call(app, '/orders')).status, 401);
  assert.equal((await call(app, '/data/export?dataset=products')).status, 401);
});
