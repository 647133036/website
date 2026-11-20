# 测试体系

四层测试覆盖：单元测试、集成测试、系统测试、压力测试。基于 Node 22 内置 `node:test`（零额外框架依赖），集成测试用 `supertest` 打真实的 Express app。所有测试用**隔离的临时 SQLite**，不碰生产 `server/data/studio.db`。

## 快速运行

```bash
cd wireframe-studio/server
npm test          # 单测 + 集成 + 系统（一次性全跑）
npm run test:unit
npm run test:integration
npm run test:system
npm run test:load http://localhost:3999 5 100   # 需先启动服务

cd ../web
npm test          # 前端纯逻辑单测（sections resolveProps / sectionMeta）
```

压测需一个已启动的服务（独立端口 + 已种子化 DB）：

```bash
DB_PATH=/tmp/macudopa-load.db node db/seed.js   # 种子临时 DB
DB_PATH=/tmp/macudopa-load.db PORT=3999 node index.js &
npm run test:load http://localhost:3999 5 100
```

## 各层职责

| 层 | 文件 | 测什么 | 隔离方式 |
|----|------|--------|---------|
| 单元测试 | `server/test/unit.test.js` | 纯逻辑：支付网关 `charge`/`activeMethod`（mock 通过/拒付/未配置 PSP）、网关注册表 | 无状态，直接调函数 |
| 单元测试 | `web/test/sections.test.js` | 纯逻辑：`resolveProps`（默认值+覆盖）、`sectionMeta` 回退、17 个 section 的 schema 完整性 | ESM 直接 import 纯函数 |
| 集成测试 | `server/test/integration.test.js` | 真实 app + 真实 DB：auth 登录、RBAC 三级（viewer/editor/admin 的 401/403 边界）、wireframes CRUD+重排、products、orders 下单扣库存+拒付、orders/mine、data 导出/导入 权限 | 每次 `freshApp()` 用随机临时 DB |
| 系统测试 | `server/test/system.test.js` | 端到端用户旅程：匿名公开浏览 → 登录下单支付 → 库存扣减 → 我的订单 → 管理员退款 → RBAC 拒绝普通用户退款 → 导出反映状态；匿名对管理端点一律 401 | 同集成（临时 DB） |
| 压力测试 | `server/test/load.js` | 对运行中服务发并发请求，统计吞吐 / p50/p95/p99 延迟 / 错误率，错误率 >1% 判 FAIL | 打独立端口实例 |

## 测试夹具 `test/fixture.js`

`freshApp()` 的关键：

- 生成随机 `DB_PATH`，写入 `process.env.DB_PATH`
- 清空 `require.cache` 中所有 `/server/` 模块，重新 `require('../db')`（读新 `DB_PATH` 建表）+ `require('../db/seed.js')`（灌种子）+ `require('../index.js')` 构建 app
- `call(app, url, {method, body, token})`：自动补 `/api` 前缀、`supertest` 发请求、统一返回 `{status, data, res}`

## 关键约定（写测试时容易踩的坑）

- **路由前缀**：所有业务路由挂在 `/api/*`。`call` 会自动补，但直接读源码时注意 `router` 是相对的。
- **响应形状**：
  - `GET /products`、`GET /orders`、`GET /orders/mine` 返回**裸数组**（不是 `{products}` / `{orders}`）
  - `GET /wireframes` 返回**裸数组**；`GET /wireframes/:slug` 返回 `{...page, frames:{'390':[],'1440':[]}}`
  - `POST /:slug/blocks` body 字段是 `section`（不是 `section_name`），`frame` 默认 `'1440'`
  - `blockOut.visible` 是**布尔**（`!!row.visible`），不是 0/1
  - `POST /orders` 返回 `{ ok, order }`，订单状态在 `data.order.status`
  - 数据导出参数是 `datasets`（**复数**），JSON 导出结构 `{ exportedAt, datasets:{orders:[...]} }`
- **支付**：mock 网关 `last4==='0000'` 拒付（402），其它卡号通过；未配置 Stripe key 时走 mock 或明确报 `not configured`，绝不静默通过。

## 压力测试结果（本机基线，可复测）

对 `GET /api/products`（鉴权后读接口）：

| 并发 | 吞吐 | p50 | p95 | p99 | 错误率 |
|------|------|-----|-----|-----|--------|
| 40 | ~1185 req/s | 17.5ms | 44.6ms | 510ms(冷) | 0% |
| 100 | ~2820 req/s | 32.7ms | 60.3ms | 103ms | 0% |

c=100 仍 0 错误、p95 < 70ms，单实例余量充足。p99 在低并发偶发尖刺（SQLite WAL + 首次冷查询）属正常，稳态后收敛。

## 说明

- 无 ESLint / 前端组件测试框架（Vitest）：项目保持零多余依赖；前端组件级测试如需引入 `vitest`+`@testing-library/react` 可后续补，当前纯逻辑（sections schema）已用 `node:test` 覆盖。
- 压力测试是黑盒吞吐/延迟探针，不做 CPU/内存画像；需要时接 `clinic` 或 `0x` 做火焰图。
