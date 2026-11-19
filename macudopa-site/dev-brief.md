# MacuDopa — Dev Brief (Shopify Liquid / Horizon)

How to build the MacuDopa design into a Shopify theme based on the Horizon template architecture (Online Store 2.0 / Horizon successor), with a quoting-ready task breakdown. Companion to `design-brief.md`.

## 1. Theme structure

Standard OS 2.0 / Horizon tree, all sections carry a `schema.json` so they are editable in the theme editor.

```
layout/theme.liquid
sections/
  header.liquid
  footer.liquid
  hero.liquid
  timing-stats.liquid
  support-cards.liquid
  continuum-timeline.liquid
  testimonial.liquid
  newsletter.liquid
  page-hero.liquid
  product-grid.liquid        (collection)
  product-page.liquid       (PDP: media, variants, add-to-cart)
  product-recommendations.liquid
  shop-banner.liquid
  faq-accordion.liquid
  support-strip.liquid
  values-grid.liquid
  story-split.liquid        (text + botanical panel)
snippets/
  product-card.liquid       (inline SVG bottle, day/night/bundle variants)
  logo-mark.liquid          (the pod symbol, reused in header + footer)
  section-spacing.liquid
templates/
  index.json
  collection.json
  product.json
  page.faq.json            (template alias)
  page.story.json
config/
  settings_schema.json
  settings_data.json
assets/
  theme.css   theme.js
locales/en.default.json
README.md     (run / publish / metafields / menus)
```

Templates reference sections in order; `index.json` is:
`[header] → [hero] → [timing-stats] → [support-cards] → [continuum-timeline] → [testimonial] → [newsletter] → [footer]`.

`collection.json`: `[header] → [shop-banner] → [product-grid] → [newsletter] → [footer]`.

`page.faq.json`: `[header] → [page-hero] → [faq-accordion] → [support-strip] → [footer]`.

`page.story.json`: `[header] → [hero (story style)] → [values-grid] → [story-split] → [support-strip] → [footer]`.

`product.json`: `[header] → [product-page] → [product-recommendations] → [newsletter] → [footer]`.

## 2. Section → Liquid mapping

- **header.liquid** — `{{ section.settings.logo | image_url }}` (fallback to `snippets/logo-mark`), `linklist` for nav (`link_list_header`), cart count via `cart.count` + AJAX `cart.js`. Mobile drawer reuses the same linklist in a `details/summary` or JS panel.
- **hero.liquid** — `image_and_text` / `image-banner` pattern: `image` setting, `heading`, `subheading`, up to two `button` blocks. `full_width` + overlay tint setting.
- **product-grid.liquid** — loop `collection.products`; render `snippets/product-card`. Filters: use the native collection swatches / tag filter (`/collections/<handle>`) or `facets.json`; sort is the native `sort_by` dropdown. Card price via `product.price | money` with `settings.currency` handling.
- **product-card.liquid** — `product.featured_image`, `product.title`, `product.price`, `product.url`; add-to-cart form posting to `/cart/add` with `product_id`. Badge from `product.metafields.badge`.
- **continuum-timeline.liquid** — static section (brand infographic). Dose + On/Fade/Off as hard-coded 24-col band with a `show` toggle; or drive from metafields if data ever becomes dynamic. Low effort, high brand value, keep as a fixed visual.
- **faq-accordion.liquid** — `rich_text` blocks, one per question/answer; single-open accordion via `details`/`summary` (native, no JS dependency) or a small JS toggle. Content editable in theme editor.
- **testimonial.liquid** — `image_and_text` style; block with `quote` (rich_text), `attribution`.
- **values-grid / support-cards / botanical-panel / story-split** — `rich_text` + `image` blocks, grid columns per section setting.

## 3. Theme settings (`config/settings_schema.json`)

- **Colors** (5 settings): precision-white, macuna-purple, day-orange, night-purple, support-green, with defaults from the design brief.
- **Typography**: three `font_picker` settings (display, product, body) pre-set to the stand-in fonts; add a `font_family` note field to drop in licensed Caslon Ionic Rounded / TWK Lausanne later.
- **Logo**: `image` setting (pod mark + wordmark), plus a `show_symbol` toggle.
- **Social links**: three `link` settings (Instagram, YouTube, TikTok) used in the footer.
- **Buttons/radius**: optional radius + CTA-label settings.

## 4. Liquid / platform specifics

- Use `liquid` `section` schema so every section is editor-configurable; avoid hard-coded content except the continuum infographic.
- Money: `{{ product.price | money }}` respects currency; bundle discount shown via `product.compare_at_price` (set 143.18 vs 170.00 compare-at to surface a save).
- Cart: use `/cart/add.js` AJAX; keep the header cart-count bubble updating without reload.
- SEO/structured data: add JSON-LD `Product` + `BreadcrumbList` on the product and collection templates.
- Performance: `loading="lazy"` on all below-the-fold images; `srcset` for hero + product images; preconnect to fonts; inline-critical header/footer CSS.
- Accessibility: `aria-expanded` on accordion, `alt` on all images (product = title, hero = "" + `aria-hidden` scrim), visible focus states on pills/links, colour-contrast per design brief.
- Metafields needed: `product.badge`, `product.meta` (formula description), `product.feature_variant` (day/night colour), and a `product.timing_meta` if the per-product "find your timing" block is expanded later.

## 5. Asset plan

| Asset | Source | Status |
|---|---|---|
| Pod logo mark | Generated SVG (snippets/logo-mark) | Done |
| Product bottle visuals | Inline SVG (`snippets/product-bottle`) | Done, swap to licensed packshots |
| Hero photo | Toolkit (placeholder, unlicensed) | License before launch |
| Lifestyle / botanical | Toolkit (botanical = license-free per p.45) | Botanical safe; lifestyle license |
| Favicons / social icons | Toolkit p.16 | Generate |

## 6. Dev quoting (task + hours)

Blended estimate in hours. At a UK web-dev day rate, this lands inside the £2–3k envelope (see note at bottom).

| # | Task | Est. hours |
|---|---|---|
| 1 | Theme scaffold + brand tokens in `settings_schema` (colours, fonts, logo, socials) | 4–6 |
| 2 | Header (nav, cart bubble, mobile drawer) + Footer (4-col, socials, newsletter) | 6–8 |
| 3 | Homepage: hero, timing-stats, support-cards, continuum-timeline, testimonial, newsletter | 8–12 |
| 4 | Shop: shop-banner + product-grid + product-card + filters/sort | 8–10 |
| 5 | Product detail template + related/upsell | 6–8 |
| 6 | FAQ accordion + practitioner support strip | 3–4 |
| 7 | Our Story page (values, origin, botanical panel) | 4–5 |
| 8 | Newsletter / email-capture integration (Klaviyo or Shopify email) | 3–4 |
| 9 | Responsive QA + cross-browser + a11y + performance pass | 6–8 |
| | **Total** | **48–65 h** |

Budget check: at a blended £40–55/h, 48–65h = £1,900–£3,600. To stay inside the £2–3k band, scope to the mid estimate (~52h, ≈£2,100–2,800) and treat items 5, 8 and 9's deep pass as optional upsell. Fixed-price option: cap at 50h for £2,400.

## 7. Exclusions (define up front, protects the budget)

- Copywriting / medical copy review (brand copy is supplied in the toolkit; a compliance pass by a pharmacist/legal is out of scope).
- Photography licensing and final packshot photography.
- Ongoing content population (products, journals, store-locator data).
- Payment / shipping / 3PL configuration beyond theme basics.

## 8. Definition of done

- 4 public templates + product template live on a development store.
- All sections editor-configurable; brand tokens centralised.
- Mobile (390px) + desktop (1440px) verified; cart works; FAQ single-open; continuum renders.
- Lighthouse mobile ≥ 90 performance, a11y ≥ 95; JSON-LD present on product/collection.
- `settings_data.json` committed so the theme ships pre-branded.
