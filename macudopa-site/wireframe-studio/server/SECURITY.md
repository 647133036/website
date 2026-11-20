# 信息安全审查报告

对象：`wireframe-studio`（Express + SQLite + JWT 全栈独立站）+ Shopify 主题。
范围：**防御性代码安全审查**——找出代码自身的安全缺陷并加固。不含网络攻击测试 / 漏洞扫描 / 爆破 / 逆向（平台禁止）。

## 一、已具备的安全控制（保持）

- **密码**：`scrypt` + 每用户随机 16 字节 salt + `crypto.timingSafeEqual`（抗时序攻击）。
- **SQL 注入**：全参数化查询；数据导入/导出（products/orders/wireframes/users）逐字段 `?` 绑定，无拼接。
- **越权（IDOR）**：授权**始终从 DB 重读角色**（`requireRole` → `group_role`），不信任 access token 里的 `role` claim → 改组/降级**立即生效**，无"过期提权"。
- **RBAC 边界**：viewer/editor/admin 三级；写端点逐一点名守卫；`data` 路由整体 `router.use(requireAuth, requireRole('admin'))`。
- **支付**：mock 对 `last4=0000` 拒付（402）；未配置真实 PSP 时明确报 "not configured"，**绝不静默通过**（never fails open）。
- **凭据管理**：无已提交的真实密钥；仅 `.env.example`（占位符）入库；`data/`、`*.log`、`node_modules/` 已 gitignore。
- **CSRF/请求体**：写操作用 Bearer token（非 cookie 会话），天然免疫传统 CSRF；同时接受 JSON + urlencoded（网关兼容）。

## 二、本次修复（commit `fe70e8e`）

| # | 严重度 | 问题 | 修复 |
|---|--------|------|------|
| 1 | 中 | `config/auth.js` 的 `ACCESS_SECRET`/`REFRESH_SECRET` 有**公开已知的硬编码默认值**。生产忘设 env → 任何人可离线伪造有效 token 登录任意账号 | `NODE_ENV=production` 且密钥缺失 → `process.exit(1)` 拒绝启动；dev 仍用占位值。已验证：prod 缺密钥时启动即 FATAL |
| 2 | 中 | `express.json`/`urlencoded` 无显式 body 上限，超大 payload（尤其数据导入的大 JSON）可打满内存（DoS） | 显式 `limit`：prod `json 2mb / urlencoded 1mb`，dev `10mb/5mb`；超限 → 413，非法 JSON → 400（不再 500） |
| 3 | 低（信息泄漏） | 全局 error handler 把 `err.message`（可能含 SQL/库/堆栈细节）直接回客户端 | 生产 5xx 一律回通用 `Internal error` + 仅 `console.error` 写服务端；关闭 `x-powered-by` 指纹 |
| 4 | 低 | `data/import` 用户导入缺 password 时落**固定弱口令 `changeme123`**（可被枚举/爆破） | 改为生成一次性 `crypto.randomBytes(8)` 16 位随机强口令，经响应 `temporaryPasswords` 回传，移除弱默认 |

附带：新增可选 `CORS_ORIGINS` 白名单（设置后收紧 origin，未设仍允许 dev/预览网关）。

## 三、遗留建议（非阻断，上线前处理）

1. **登录限流**：`/auth/login` 无速率限制，可被在线口令爆破。生产建议加 `express-rate-limit`（按 IP + email 双维，登录失败 N 次锁 M 分钟）。当前为 demo，未引入新依赖。
2. **CORS 默认 allow-any**：dev/预览必需，但**生产必须设 `CORS_ORIGINS`**（已支持）。
3. **真实 PSP 接入**：Stripe 已预留 `PaymentIntent` 创建；接真实卡号需补前端 3DS/卡号采集（当前 mock 只送 `last4`）。
4. **密钥轮换**：access/refresh 分密钥已分离；建议定期轮换并保留 refresh token 吊销机制（当前 refresh 为无状态 JWT，无法主动吊销）。
5. **SQLite 单文件**：`data/` 已 gitignore，确保生产不落盘敏感 DB；备份策略另定。

## 四、验证

- 新增 2 项安全集成测试（导入临时口令、非法 JSON → 400）；全量 **23 项测试通过**。
- 生产模式缺密钥启动被拒（手动验证 FATAL）。
- 无真实密钥 / `.env` 入库（`git ls-files` 核查）。
