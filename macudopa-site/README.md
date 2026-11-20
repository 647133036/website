# MacuDopa Site Demo

MacuDopa 独立站 Demo —— 一套「**Shopify 主题 + 独立站全栈后台 + Figma 式模块化页面编辑器**」三位一体的交付物。

它模拟把原 Mother London 品牌站重命名为 **MacuDopa**（一款面向帕金森 PD 人群、基于 Mucuna pruriens（HPLC 标准化）+ BF12 的天然支持方案）后的完整落地：静态原型、可编辑的 Shopify OS 2.0 主题、以及一个能像 Figma 一样「每个页面自己设计、模块可拖拽、可填内容、可实时预览」的独立站后台。

---

## 一、目录总览

```
macudopa-site/
├─ index.html / shop.html / faqs.html / our-story.html   # 静态 HTML 原型（4 个核心页）
├─ css/main.css  js/main.js                                # 原型样式与脚本
├─ design-brief.md  dev-brief.md  figma-wireframe-spec.md  # 设计 / 开发 / Figma 标注说明
├─ assets/img/                                               # 已下载的 75 张素材图
├─ theme/                                                    # Shopify OS 2.0（Dawn 兼容）主题
│  ├─ sections/      # 17 个 Liquid section（与 Studio 模块一一对应）
│  ├─ templates/     # index / collection / product / page.faq / page.story
│  ├─ snippets/  layout/  config/  assets/  locales/
│
└─ wireframe-studio/          # 独立站全栈「Wireframe Studio」
   ├─ server/                # Express + SQLite + JWT + RBAC 后端
   │  ├─ index.js           # 入口（:3001）
   │  ├─ routes/            # auth / users / groups / wireframes / products / orders / data
   │  ├─ db/ (index.js, seed.js)   # better-sqlite3 schema + 种子
   │  ├─ config/payment.js  # 支付网关抽象（mock / Stripe / PayPal）
   │  └─ data/studio.db     # SQLite 数据库（含种子数据）
   └─ web/                   # React + Vite 前端 SPA（:5180，/api 反代到 :3001）
      ├─ src/
      │  ├─ App.jsx        # 路由：登录态 / 未登录态两套
      │  ├─ auth.jsx       # AuthProvider / can() 角色判断
      │  ├─ lib/          # api.js(URL-encoded 请求) / sections.js(17 模块 schema) / cart.jsx
      │  ├─ components/   # Shell / sections.jsx(SectionRenderer) / shop.jsx / ui.jsx
      │  └─ pages/        # Studio / Preview / PageDetail / Shop / PDP / Orders /
      │                    #   MyOrders / ProductsAdmin / Users / Groups / Data / Auth
      └─ public/img/       # 前端引用素材
```

---

## 二、三个组成，各自解决什么

### 1. 静态原型（`index.html` 等 4 个）
- Home / Shop / FAQs / Our Story 四个页面的**可点击参考**，纯 HTML+CSS+JS，无构建。
- 用来锁定视觉、文案与信息架构；颜色体系：`#FBF5E3 / #2B0512 / #FFA91F / #B46BA3 / #83B881`。
- 直接双击打开即可看，无需任何服务。

### 2. Shopify OS 2.0 主题（`theme/`）
- 标准 Dawn 结构，**17 个 Liquid section** 可拖入 Shopify 在线主题编辑器编辑、发布。
- 每个 section 带 `schema.json`（编辑器里的标签、输入项、预设），可独立开关、排序。
- 模板：`index.json`（首页）、`collection.json`（商店）、`product.json`（商品详情）、`page.faq.json`、`page.story.json`。
- 用途：真正把站「架」到 Shopify 上时用；模块命名与 Studio 的 block id 对齐，便于迁移。

### 3. Wireframe Studio（`wireframe-studio/`，本 Demo 主角）
一个**独立的全栈应用**（React 前端 + Express/SQLite 后端），把「页面」建模成
**page → frame(390/1440) → block(section 模块)** 三层，让你：

- **每个页面都能自己设计**：5 个页面（home / shop / product / faq / our-story），每个页面有 390 与 1440 两个画帧。
- **模块可自由设计**：
  - **增 / 删** 任意模块；
  - **拖拽排序**：按住模块左侧 `‖` 拖柄拖到任意位置松手（也保留 ↑↓ 按钮兜底）；
  - **显隐**：`● / ○` 一键隐藏某模块；
  - **填内容**：点模块展开动态字段面板，按该模块的 schema 填标题 / 正文 / 图片 / 列表 / 时间线 / 问答对等，**改动即时反映到右侧 390/1440 实时预览**；
  - **模块 id = Liquid section 名**：与 Shopify 主题同名，编辑器里看到的就是会发布到站上的那个 section。
- **真实购物流程**：商店页、商品详情页（多图画廊 + 富详情）、加购、结算、下单、支付（可插 mock / Stripe / PayPal）。
- **管理后台**：订单、商品、用户、用户组（RBAC）、数据导入 / 导出。

---

## 三、核心概念速查

### 三层数据模型（后端 SQLite）
| 表 | 作用 | 关键字段 |
|----|------|----------|
| `wireframe_pages` | 页面 | `slug, title, description` |
| `wireframe_blocks` | 模块（挂在某页某帧） | `page_slug, frame(390/1440), section_name, label, visible, order_idx, props_json` |
| `products` | 商品 | `slug, name, price, variants_json, gallery_json, detail_json, stock` |
| `orders` | 订单 | `ref, user_id, status, subtotal, shipping, total, line_items_json, payment_json` |
| `users` / `user_groups` | 用户 / 角色组 | 用户 `group_id` → 组 `role`（admin/editor/viewer） |

### 17 个可编辑模块（`web/src/lib/sections.js` 的 `SECTIONS`，单一事实来源）
`header` · `hero` · `timing-stats` · `support-cards` · `continuum-timeline` · `testimonial` · `newsletter` · `footer` · `shop-banner` · `product-grid` · `product-page` · `product-recommendations` · `page-hero` · `faq-accordion` · `support-strip` · `values-grid` · `story-split`

- 每个模块带 `fields[]`（key / type / label / 默认值）：编辑器据此**自动生成表单**，渲染器读同一份 key。
- `product-grid` / `product-page` 是「活模块」：内容直接来自数据库商品，无需手填。

### RBAC 三级角色
| 角色 | 登录 | 能做 |
|------|------|------|
| **viewer** | `view@macudopa.com` / `view123` | 逛店、买、看内容页、查**自己**的订单（`/my-orders` 只看本人） |
| **editor** | `design@macudopa.com` / `design123` | viewer 全部 + 编辑模块（增删 / 拖拽 / 填内容 / 显隐） |
| **admin** | `admin@macudopa.com` / `admin123` | editor 全部 + 管理订单 / 商品 / 用户 / 用户组 / 数据导入导出 / 退款 / 增删页面 |

> 未登录也能逛：首页、Shop、商品详情、FAQs、Our Story 全部公开可读（后端 `GET /api/wireframes*`、`GET /api/products` 已放开匿名读；写操作需登录）。只有进 Studio 编辑、后台管理、查订单需要登录。

---

## 四、快速开始

### 前置
- Node.js ≥ 18（含 `better-sqlite3` 原生模块，需能编译；无网络也可用预装 `node_modules`）。

### 1) 启动后端（:3001）
```bash
cd wireframe-studio/server
npm install        # 已装可跳过
npm run seed       # 首次：建表 + 灌入种子（用户 / 页面 / 模块 / 商品）；已存在则部分幂等
npm start          # 或 npm run dev（--watch）
```
> 想彻底重置数据：删掉 `server/data/studio.db` 再 `npm run seed`。

### 2) 启动前端（:5180）
```bash
cd wireframe-studio/web
npm install        # 已装可跳过
npm run dev
```
打开 `http://localhost:5180`。Vite 已把 `/api` 反代到 `:3001`。

### 3) 登录
- 管理员：`admin@macudopa.com` / `admin123` → 进 `/studio`
- 普通用户：`view@macudopa.com` / `view123` → 进 `/shop`
- 或直接逛：不登录访问 `/`、`/shop`、`/faq`、`/our-story`。

### 4) 在 Studio 里设计页面
1. 左侧选页面（home / faq / our-story…），顶部切 **Mobile 390 / Desktop 1440**。
2. 模块列表：`+ Add section…` 加模块、`×` 删、`●/○` 显隐、`‖` 拖到任意位置排序、`↑↓` 微调。
3. 点某个模块 → 右侧展开字段面板，改内容，右侧画布**即时预览**。
4. 商店 / 商品详情是活模块，内容自动来自商品数据。

---

## 五、API 一览（后端 :3001）

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/api/auth/login` | 公开 | 登录，返回 `accessToken / refreshToken / user` |
| POST | `/api/auth/register` | 公开 | 注册（默认 viewer） |
| GET | `/api/auth/me` | 登录 | 当前用户 |
| GET | `/api/wireframes` | **公开** | 页面列表 |
| GET | `/api/wireframes/:slug` | **公开** | 某页双帧全模块 |
| POST | `/api/wireframes` | admin | 新建页面 |
| DELETE | `/api/wireframes/:slug` | admin | 删页面 |
| POST | `/api/wireframes/:slug/blocks` | editor+ | 加模块 |
| PUT | `/api/wireframes/:slug/blocks/:id` | editor+ | 改模块（label/props/section/visible/order） |
| PUT | `/api/wireframes/:slug/reorder` | editor+ | 整帧重排（body=`{frame, order:[id..]}`） |
| PATCH | `/api/wireframes/:slug/blocks/:id/visibility` | editor+ | 切显隐 |
| GET | `/api/products` · `/api/products/:slug` | **公开** | 商品列表 / 详情 |
| POST/PUT/DELETE | `/api/products…` | admin | 商品管理 |
| POST | `/api/orders` | 登录 | 下单（按角色校验库存与金额） |
| GET | `/api/orders` | 登录 | 订单列表（admin 全量，其余只看自己） |
| GET | `/api/orders/mine` | 登录 | **只看本人订单**（`/my-orders` 用此） |
| GET | `/api/orders/payment` | 公开 | 当前支付网关状态 |
| POST | `/api/orders/:ref/refund` | admin | 退款（走当前网关） |
| GET | `/api/data/export?datasets=..&format=json\|csv` | admin | 导出 |
| POST | `/api/data/import` | admin | 导入（按 key upsert） |
| GET/POST/PUT | `/api/users` · `/api/groups` | admin | 用户 / 用户组管理 |

> **请求体约定**：所有写操作前端统一用 `application/x-www-form-urlencoded`（嵌套对象用 qs 括号记法，如 `items[0][slug]=x`），避免预览网关对 `application/json` POST 缺少 `Access-Control-Allow-Origin` 的 CORS preflight 问题；后端 `express.urlencoded({extended:true})` + `express.json({type:['application/json','text/plain']})` 两种都收。

---

## 六、支付网关（可插拔）

`server/config/payment.js` 抽象了网关，默认 **mock**（卡号末位 `0000` 被拒，模拟真实拒付）：

| `PAYMENT_METHOD` | 行为 |
|------------------|------|
| `mock`（默认） | 内存结算，无需密钥，直接演示下单→支付→退款 |
| `stripe` | 设 `STRIPE_SECRET_KEY` 后服务端创建**真实 PaymentIntent**；未配密钥则明确报「未配置，请用 mock」，**绝不放行** |
| `paypal` | 预留（`PAYPAL_CLIENT_ID / SECRET`） |

`capture()` / `refund()` 已预留，退款接口 `POST /api/orders/:ref/refund` 按当前网关执行（mock 直接改状态；Stripe 调 `stripe.refunds`）。密钥只进 `.env`（见 `server/.env.example` 占位符），**不写进代码或仓库**。

---

## 七、数据导入 / 导出（admin）

- **导出**：`GET /api/data/export?datasets=users,groups,products,orders,wireframes&format=json`（或 `csv`）。
- **导入**：`POST /api/data/import`，body 为 `{ datasets, format, payload }`，按主键 upsert：
  - 商品按 `slug`、订单按 `ref`、页面按 `slug`、用户组按 `name`、用户按 `email`。
- 前端 `Data` 页提供「选数据集 → 导出 JSON/CSV → 上传导入 → 一键下载全部」；`My orders` 页有「导出本人订单 CSV」。

---

## 八、Shopify 主题与 Studio 的对应关系

Studio 里每个 block 的 **section_name 就是 Shopify 主题里的 Liquid section 文件名**（如 `faq-accordion` ↔ `theme/sections/faq-accordion.liquid`）。因此：
- 在 Studio 设计好的页面结构 → 直接映射到 `theme/templates/*.json` 的 section 列表；
- 模块的 `props` → 对应 Shopify section 编辑器里的设置项（section `schema.json` 的 settings/blocks）。
迁移时只需把 `props_json` 按 section 的 `schema.json` 键写入对应 template，即可在 Shopify 编辑器里继续细调与发布。

### 8.1 部署 Shopify 主题（手动 / CLI 两种方式）

**方式 A：Shopify 在线编辑器（手动，最稳）**
1. 打开 Shopify 后台 → 线上商店 → 自定义（OS 2.0 主题编辑器）。
2. 上传/导入 `theme/` 为 `.theme` 包：把 `theme/` 整目录打包成 zip（根目录含 `layout/theme.liquid`、`sections/`、`templates/`、`config/`），在编辑器「上传主题 zip」导入。
3. 导入后在编辑器里逐个模板（首页 / 集合 / 商品 / 页面）核对 section 顺序，与 Studio 里设计的一致。
4. 「发布」该主题。
5. 在编辑器里把模块的 `settings`/`blocks` 按 Studio 里填的内容补一遍（或直接用 8.2 的导出 JSON 批量替换）。

**方式 B：Shopify CLI（推荐，可重复 / 可 PR）**
```bash
# 安装 CLI（npm 全局）
npm install -g @shopify/cli
# 用 theme 目录作为工作区，发布到线上商店
cd theme
shopify theme publish --store <你的商店>.myshopify.com
# 或推送为草稿主题再手动发布
shopify theme push --store <你的商店>.myshopify.com
```
> CLI 需要商店账号 + 主题令牌（`shopify theme auth`），首次按提示走 OAuth。`theme publish` 直接上线，`theme push` 进草稿区。

### 8.2 把 Studio 模块导出为 theme templates

Studio 里的页面（`GET /api/wireframes` 返回 `frames` → `frame.1440[]` 每项是 `{ section, label, visible, order, props }`）需要转成 `templates/*.json` 的 `[ { type, settings, blocks } ]` 数组。对应规则：

| Studio block | 模板 JSON 项 | 说明 |
|--------------|-------------|------|
| `section` (如 `hero`) | `"type": "hero"` | 直接同名 |
| `props` (如 `{eyebrow, headline, image}`) | 展开到该 section 的 `settings` 或 `blocks[].settings` | 按 `theme/sections/<type>.liquid` 里 `schema.json` 的键名映射 |
| `visible === false` | 该项省略（不写入模板） | 隐藏模块不出现在模板 |
| `order` | 数组顺序（自上而下） | 模板按数组顺序渲染 section |

落地步骤（在 Studio 前端或脚本里做一次性转换）：
```js
// page = await fetch('/api/wireframes/home')  → { frames: { '1440': [block...] } }
const toTemplate = (blocks) =>
  blocks.filter((b) => b.visible).map((b) => {
    const s = b.props || {};
    return { type: b.section, ...(s.settings || {}) };   // settings 键按 section schema 映射
  });
// 首页 → templates/index.json；商店 → collection.json；商品 → product.json；
// faq 页 → page.faq.json；our-story → page.story.json
```
- 键名映射对照 `theme/sections/<type>.liquid` 的 `schema.json`：例如 `hero` 的 `eyebrow/headline/subhead/image` 对应其 `blocks` 里的 `eyebrow/headline/subhead` 等类型；若某 section 用 `settings`（非 blocks），则直接 `{ type, settings: props }`。
- 商品类活模块（`product-grid` / `product-page` / `product-recommendations`）在 Shopify 里是动态集合/单品，不需要 `props`，只写 `{ "type": "product-grid" }` 即可。
- 导出后写回 `theme/templates/*.json`，再走 8.1 方式 B `shopify theme push` 上线；或在编辑器里粘贴进对应模板的「Section 列表」。

> 注意：Shopify 模板里的 section `type` 必须与 `theme/sections/` 文件名一致（去掉 `.liquid`）；props 键名必须与 section 的 `schema.json` 一致，多余键会被编辑器忽略，缺失键用 schema 默认值。



---

## 九、常用操作备忘

- **重置数据库**：删 `server/data/studio.db` 后 `npm run seed`（重建表 + 灌种子）。
- **改种子内容**：`server/db/seed.js`（3 组、3 用户、5 页面 × 双帧、4 商品）。
- **加模块类型**：`web/src/lib/sections.js` 加一条 `SECTIONS` 条目 + `components/sections.jsx` 加一个渲染器 + 主题加同名 `.liquid`。
- **本地预览入口**（本开发环境）：`https://5180-f80defe8516eb8f6.monkeycode-ai.online`（Vite :5180，/api 反代 :3001）。
  - 预览网关只暴露 Vite 的 5180；旧端口（如 8199）已失效，统一用 5180 入口。
  - 前端是 SPA，改过代码后浏览器要**强刷**（Cmd/Ctrl+Shift+R）或开无痕窗口，否则会拿到旧 JS 缓存，出现「点链接不跳转 / 看到旧行为」。

---

## 十、测试体系

四层测试，全绿（24 项 + 主题结构校验）。零框架依赖（用 Node 22 内置 `node:test`），集成测试仅加 `supertest`，全部用**隔离的临时 SQLite**，不碰生产 `server/data/studio.db`。

```bash
cd wireframe-studio/server && npm test        # 单测 + 集成 + 系统，一次性全跑
cd wireframe-studio/web    && npm test        # 前端纯逻辑单测
node theme-lint.js                                    # Shopify 主题结构校验
```

| 层 | 文件 | 覆盖 |
|----|------|------|
| 单元 | `server/test/unit.test.js` | 支付网关 `charge`/`activeMethod`（mock 通过 / `0000` 拒付 / 未配置 PSP 明确报错，绝不静默通过） |
| 单元 | `web/test/sections.test.js` | `resolveProps` 默认值+覆盖、`sectionMeta` 回退、17 个 section schema 完整性 |
| 集成 | `server/test/integration.test.js` | 真实 app + 临时 DB：auth 登录、RBAC 三级 401/403 边界、wireframes CRUD+重排、orders 下单扣库存+拒付+**定价数学（variant delta / 免邮阈值 / 运费）/库存 409/参数 400**、`/orders/mine` 仅本人、data 导出/导入权限 |
| 系统 | `server/test/system.test.js` | 端到端用户旅程：匿名公开浏览 → 登录下单支付 → 库存扣减 → 我的订单 → 管理员退款 → RBAC 拒绝普通用户退款 → 导出反映 `refunded` |
| 压力 | `server/test/load.js` | 对运行实例发并发请求，统计吞吐 / p50/p95/p99 / 错误率（基线 c=100 → ~2820 req/s、p95 60ms、0 错误） |

- 详细运行步骤、夹具机制（`test/fixture.js` 每次随机临时 DB + 清 `require.cache`）、接口契约易踩点见 `wireframe-studio/server/test/README.md`。
- 主题结构校验（`theme-lint.js`）验证 16 个 section 的 schema JSON 可解析且含可编辑面（settings/blocks/presets）、Liquid `{%`/`%}` 与 `{{`/`}}` 配对、模板引用的 section 文件确实存在、必备主题文件齐全；已负向验证（人为破坏标签 → 正确报 FAIL）。

---

## 十一、技术栈

- 前端：React 18 + Vite + react-router-dom（SPA，URL-encoded API 客户端）
- 后端：Node + Express + better-sqlite3 + jsonwebtoken（JWT access/refresh）
- 支付：stripe（可选）/ mock
- 主题：Shopify OS 2.0 / Dawn 兼容 Liquid + JSON 模板
- 角色模型：user → user_groups(role)，`can(role, need)` 判断
