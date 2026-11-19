# MacuDopa Shopify Theme

OS 2.0 / Horizon-compatible Shopify theme, mapped from the Mother London re-brand. Editable in the Shopify theme editor, publishable to a store.

## Run / publish

```bash
# install the Shopify CLI once
npm i -g @shopify/cli

# point at your store
export SHOP_STORE="macudopa.myshopify.com"

# local preview with live editing
npm run dev

# publish to the live theme
npm run publish
```

Or without the CLI: zip the `theme/` folder and upload in Shopify admin → Online store → Themes → Add theme.

## Structure

```
layout/theme.liquid        document shell, section order, meta
sections/                  every visual block, each with a schema.json
  header.liquid            sticky header + mobile drawer
  hero.liquid              split/centered hero (eyebrow/headline/subhead/buttons)
  timing-stats.liquid      "Find your timing" stat blocks
  support-cards.liquid     Day / Night / Routine cards
  continuum-timeline.liquid 24h On/Fade/Off symptom-control band
  testimonial.liquid       quote block
  newsletter.liquid        email capture
  page-hero.liquid         inner-page header strip
  shop-banner.liquid       collection banner
  product-grid.liquid      filterable / sortable product grid
  product-page.liquid      PDP: media, price, variants, add-to-cart
  product-recommendations.liquid
  faq-accordion.liquid     single-open FAQ
  values-grid.liquid       Our Story value cards
  story-split.liquid       text + botanical panel
  support-strip.liquid     practitioner-guided CTA
  footer.liquid            4-col footer + socials + newsletter
snippets/
  logo-mark.liquid         reusable pod symbol (dark/light)
  product-card.liquid      card + inline bottle SVG
  section-spacing.liquid
templates/
  index.json  collection.json  product.json  page.faq.json  page.story.json
config/
  settings_schema.json     brand colour / font / social settings
  settings_data.json       pre-branded defaults (ships ready)
assets/
  theme.css  theme.js
locales/en.default.json
```

## Brand tokens (settings_schema)

- Colours: Precision White `#FBF5E3`, Macuna Purple `#2B0512`, Day Orange `#FFA91F`, Night Purple `#B46BA3`, Support Green `#83B881`.
- Fonts: `font_picker` slots pre-set to free stand-ins (Bitter / Fraunces / Hanken Grotesk). Enable `type_swap_commercial` and upload Caslon Ionic Rounded + TWK Lausanne when licensed.
- Logo: leave `logo_image` blank to use the generated pod mark.

## Product metafields

Namespace `mcp`, keys: `category` (day/night/bundle), `formula`, `meta`, `badge`, `is_bundle` (boolean), `line_one`, `line_two`. Set in Products → metafields. The card and PDP read these with sensible defaults so the theme works out of the box.

## Menus

Create linklists: `main-menu` (Shop / FAQs / Our story), `footer-about`, `footer-help`, `footer-legal`. Map in the Header / Footer sections.

## Page aliases

- FAQs page → template `page.faq`
- Our Story page → template `page.story`

## Excluded from scope (protects the £2–3k budget)

Medical copy/compliance review, photography licensing and packshot capture, ongoing content population, payments/shipping/3PL config.
