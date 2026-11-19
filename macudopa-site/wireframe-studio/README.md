# MacuDopa Wireframe Studio

Full-stack Figma-style wireframe manager **plus a working MacuDopa storefront**: backend edit, live preview, user & user-group management, a product catalogue, a cart + mock payment/checkout, and an admin dashboard (orders + product management).

## Stack
- **Backend** — `server/` : Express + SQLite (better-sqlite3) + JWT. Port `3001`.
- **Frontend** — `web/` : Vite + React. Port `5180`, proxies `/api` → `:3001`.

## Run
```bash
# backend
cd server && npm install && node db/seed.js && node index.js
# frontend (other terminal)
cd web && npm install && npm run dev
```
Open `http://localhost:5180`.

> Seed logins and a 4-product catalogue. If you change the DB schema or add seed data, delete `server/data/studio.db` and re-run `node db/seed.js`.

## Seed logins
| role | email | password | group |
|---|---|---|---|
| admin | admin@macudopa.com | admin123 | Founders |
| editor | design@macudopa.com | design123 | Design Team |
| viewer | view@macudopa.com | view123 | Viewers |

## Roles / permissions
- **viewer** — read pages & blocks, browse shop, place orders. No edits.
- **editor** — everything viewer, plus add/update/reorder/hide/delete wireframe blocks.
- **admin** — everything editor, plus manage pages, users, groups, **orders** and **products**.

## Storefront + admin pages
| Route | Access | What |
|---|---|---|
| `/studio` | all | Figma-style wireframe editor (390/1440, live product blocks) |
| `/preview` | all | Read-only render of a wireframe |
| `/shop` | all | Product grid (search / filter / sort) from the backend catalogue |
| `/product/:slug` | all | Product detail page (variants, stock, Add to cart) |
| cart drawer | all | Add-to-cart, qty, remove → **Checkout** (mock gateway) → order confirmation |
| `/orders` | admin | Orders dashboard: stats, line items, status |
| `/products` | admin | Product CRUD (catalogue management) |
| `/users` `/groups` | admin | User + user-group management |

## Payment (mock gateway)
"Pay" is simulated: any card succeeds; a card number ending in `0000` is **declined** (HTTP 402). Orders persist to the DB and decrement stock. No real PSP is integrated — swap `POST /api/orders` for your gateway when ready.

## Data model
- `user_groups(name, role, description)` · `users(email, password_hash, name, group_id)`
- `wireframe_pages(slug, title, description)` · `wireframe_blocks(page_slug, frame 390|1440, section_name, label, visible, order_idx, props_json)`
- `products(slug, name, price, compare_price, category, tone, formula, meta, badge, description, stock, active, variants_json)`
- `orders(ref, user_id, status, subtotal, shipping, total, line_items_json, payment_json)`

Each wireframe block's `section_name` matches a Liquid section id in the companion Shopify theme, so a Figma layer maps 1:1 to the theme.

## API surface
- `POST /api/auth/{login,register,refresh}` · `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/{users,groups}` (mutations admin-only)
- `GET /api/wireframes` · `GET /api/wireframes/:slug` · `POST/DELETE /api/wireframes` (admin)
- `POST/PUT/DELETE /api/wireframes/:slug/blocks` + `PATCH .../visibility` · `PUT /api/wireframes/:slug/reorder` (editor+)
- `GET /api/products` · `GET /api/products/:slug` · `POST/PUT/DELETE /api/products` (mutations admin)
- `POST /api/orders` (auth) · `GET /api/orders` (own / all if admin) · `GET /api/orders/stats` (admin) · `GET /api/orders/:ref`

