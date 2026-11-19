# MacuDopa Wireframe Studio

Full-stack Figma-style wireframe manager: backend edit + live preview + user & user-group management.

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

## Seed logins
| role | email | password | group |
|---|---|---|---|
| admin | admin@macudopa.com | admin123 | Founders |
| editor | design@macudopa.com | design123 | Design Team |
| viewer | view@macudopa.com | view123 | Viewers |

## Roles / permissions
- **viewer** — read pages & blocks, preview. No edits.
- **editor** — everything viewer, plus add/update/reorder/hide/delete blocks.
- **admin** — everything editor, plus manage pages, users, and groups.

## Data model
`user_groups(name, role, description)` · `users(email, password_hash, name, group_id)` ·
`wireframe_pages(slug, title, description)` ·
`wireframe_blocks(page_slug, frame 390|1440, section_name, label, visible, order_idx, props_json)`.

Each block's `section_name` matches a Liquid section id in the companion Shopify theme, so a Figma layer maps 1:1 to the theme.

## API surface
- `POST /api/auth/{login,register,refresh}` · `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/{users,groups}` (mutations admin-only)
- `GET /api/wireframes` · `GET /api/wireframes/:slug` · `POST/DELETE /api/wireframes` (admin)
- `POST/PUT/DELETE /api/wireframes/:slug/blocks` + `PATCH .../visibility` · `PUT /api/wireframes/:slug/reorder` (editor+)
