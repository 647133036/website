# User Instruction Memory

本文件记录用户指令、偏好与项目级知识，供未来交互参考。

## 条目

### [构建与测试]
- 日期: 2026-11-20
- 上下文: Agent 执行 macudopa-site 四层测试建设时确立
- 类别: 构建方法
- 指令:
  - 后端测试零框架依赖，用 Node 22 内置 `node:test`；集成测试仅加 `supertest`（devDep）。
  - 运行命令：`cd wireframe-studio/server && npm test`（单测+集成+系统一次跑通）；`npm run test:unit|test:integration|test:system` 分层跑；前端 `cd wireframe-studio/web && npm test`；主题结构校验 `cd macudopa-site && node theme-lint.js`。
  - 压测：`node test/load.js <baseUrl> [sec] [concurrency]`，需先起独立实例 + 种子化临时 DB：`DB_PATH=/tmp/macudopa-load.db node db/seed.js` 再 `DB_PATH=/tmp/macudopa-load.db PORT=3999 node index.js`。
  - 测试用隔离临时 SQLite（`process.env.DB_PATH` + 清 `require.cache` 中 `/server/` 模块后重 require），**绝不碰**生产 `server/data/studio.db`。

### [接口契约易踩点]
- 日期: 2026-11-20
- 上下文: Agent 写集成/系统测试时踩到，已固化进测试
- 类别: 排错与调试
- 指令:
  - `GET /products`、`GET /orders`、`GET /orders/mine`、`GET /wireframes` 返回**裸数组**（不是 `{products}`/`{orders}`/`{pages}`）。
  - `GET /wireframes/:slug` 返回 `{...page, frames:{'390':[],'1440':[]}}`，**没有** `/:slug/:frame` 路由。
  - `POST /:slug/blocks` body 字段名是 `section`（非 `section_name`），`frame` 默认 `'1440'`；`blockOut.visible` 是**布尔**（`!!row.visible`）。
  - `POST /orders` 返回 `{ ok, order }`，订单状态在 `data.order.status`；定价：`unit = price + variantDelta`，`shipping = subtotal>=50?0:4.95`。
  - 数据导出参数是**复数** `datasets=orders,products`；JSON 导出结构 `{ exportedAt, datasets:{...} }`。
  - mock 网关 `last4==='0000'` 拒付（402），其它卡号通过；未配置 Stripe key 走 mock 或明确报 `not configured`，绝不静默通过。

### [安全基线]
- 日期: 2026-11-20
- 上下文: Agent 做信息安全审查 + 加固时确立（详见 `wireframe-studio/server/SECURITY.md`）
- 类别: 环境配置
- 指令:
  - 生产上线前必设：`ACCESS_SECRET`、`REFRESH_SECRET`（`NODE_ENV=production` 缺任一即拒绝启动，无硬编码回落）；并建议设 `CORS_ORIGINS` 白名单（默认 allow-any 仅限 dev/预览）。
  - 密钥只走 env / `.env`（未入库），代码零硬编码；密码 scrypt+随机 salt+timingSafeEqual。
  - 授权一律从 DB 重读角色，**勿改回**信任 access token 的 `role` claim（那是提权隐患）。
  - 新增写端点必须挂 `requireRole`/`requireAuth`；SQL 全参数化；大 payload 走显式 body limit。

### [可测性重构约定]
- 日期: 2026-11-20
- 上下文: 为注入临时 DB 做集成测试
- 类别: 工作流与协作
- 指令:
  - `server/index.js` 已重构为导出 `createApp()` + `require.main===module` 守卫 `listen`（行为不变，运行中的 dev 服务不受影响）。后续要测 app 时直接 `require('../index.js')()` 拿 Express 实例，不再需要监听端口。
