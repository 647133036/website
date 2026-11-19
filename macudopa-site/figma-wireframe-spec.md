# MacuDopa — Figma Wireframe Spec (frame-level, 1:1 with Liquid sections)

Drop these into Figma. Each page = one 1440-wide frame + one 390-wide frame. Every child layer is named exactly like the Shopify section / block that renders it, so a developer can trace any Figma layer to a Liquid file in one step. Tokens (colour, type, radius) come from `theme/config/settings_schema.json`.

Conventions
- Frame sizes: desktop `1440 × auto`, mobile `390 × auto`.
- Auto-layout columns; `container` = 1280 max, 24 gutter.
- Breakpoints in Figma: 0–767 (mobile), 768–1023 (tablet), 1024+ (desktop). Build mobile + desktop; tablet inherits.
- Component library = the section list below. Name Figma components identically.

---

## Page 01 — Home  (`index.json`)

### Desktop frame 1440  /  Mobile frame 390

Layer tree (name → Liquid source):
```
Page / Home
├─ section header            → sections/header.liquid
│  ├─ logo (pod + wordmark)
│  ├─ nav [shop] [faqs] [our-story]
│  └─ actions [account] [cart + bubble]
├─ section hero              → sections/hero.liquid
│  ├─ eyebrow "Natural & precise"
│  ├─ headline "The power of nature. The precision of science."
│  ├─ subhead
│  └─ buttons [Shop range] [Our story]
├─ section timing-stats      → sections/timing-stats.liquid
│  ├─ head (label "On and on and on" + heading + body)
│  └─ stat[1] "20–40 mins"   stat[2] "1.5–2.5 hrs"
├─ section support-cards     → sections/support-cards.liquid
│  └─ card[day] card[night] card[day]   (DAY / NIGHT / ROUTINE)
├─ section continuum-timeline → sections/continuum-timeline.liquid
│  ├─ copy + cont-stat × 2
│  └─ timeline [labels][band on/off/fade][doses][legend]
├─ section testimonial       → sections/testimonial.liquid
│  └─ quote + attribution
└─ section newsletter        → sections/newsletter.liquid
   └─ email + [Sign up]
```

Figma notes:
- hero: full-bleed background image slot (placeholder licensed photo), dark-left scrim, text column left (desktop) / stacked (mobile).
- continuum: band = 24 equal columns; colour On = Support Green, Fade = Day Orange @85%, Off = near-black. Dose pills span 2 columns, positioned Day @6/12/16h, Night @8/12am.
- support-cards: 3-up desktop, 1-col mobile.

---

## Page 02 — Shop / Collection  (`collection.json`)

```
Page / Shop
├─ section header
├─ section shop-banner        → sections/shop-banner.liquid
│  └─ eyebrow + headline + body + [Shop all]
├─ section product-grid       → sections/product-grid.liquid
│  ├─ toolbar [filters: all/day/night/bundles] [sort]
│  └─ grid → product-card × N
│     (snippets/product-card.liquid: square visual + bottle SVG + title + price + Add to cart)
└─ section newsletter
   (plus section footer)
```

Figma notes:
- product-card states: default / hover. Variants: `pv-day` (orange), `pv-night` (purple), `pv-bundle` (green).
- filter chip `active` = Macuna Purple fill.
- Build 4 sample cards: Complete PD Bundle £143.18, Day+Night Starter £70.18, MacuDopa Day £35, MacuDopa Night £35.

---

## Page 03 — Product  (`product.json`)

```
Page / Product
├─ section header
├─ section product-page       → sections/product-page.liquid
│  ├─ media (image or placeholder)
│  └─ info [title][price][meta][variants][add-to-cart][specs]
├─ section product-recommendations  → sections/product-recommendations.liquid
└─ section newsletter + footer
```

Figma notes: 2-col desktop (media sticky), stacked mobile. Variant radios list product variants.

---

## Page 04 — FAQs  (`page.faq.json`)

```
Page / FAQs
├─ section header
├─ section page-hero          → sections/page-hero.liquid  (eyebrow + title + body)
├─ section faq-accordion      → sections/faq-accordion.liquid  (5 items, single-open)
├─ section support-strip      → sections/support-strip.liquid   (Practitioner guided + 2 CTAs)
└─ section footer
```

Figma notes: accordion states = closed / open (icon + becomes ×). Add one "open" state per item for the dev.

---

## Page 05 — Our Story  (`page.story.json`)

```
Page / Our Story
├─ section header
├─ section hero (story style) → sections/hero.liquid  (values headline)
├─ section values-grid        → sections/values-grid.liquid   (Innovative/Optimistic/Empowering)
├─ section story-split        → sections/story-split.liquid   (text + botanical panel)
├─ section support-strip      → sections/support-strip.liquid  (Shop the range)
└─ section footer
```

Figma notes: values-grid 3-up desktop, 1-col mobile. botanical panel = image + dark gradient overlay + label.

---

## Shared components to create in Figma (one set, reused)

| Figma component | Section / snippet | Variants |
|---|---|---|
| Button | btn-primary / btn-orange / btn-ghost / btn-ghost-light | size |
| Pod logo | snippets/logo-mark.liquid | dark / light |
| Product card | snippets/product-card.liquid | day / night / bundle × state |
| Stat block | timing-stats block | value + unit |
| Support card | support-cards block | day / night |
| FAQ row | faq-accordion block | closed / open |
| Timeline band | continuum | on / fade / off seg, dose day / night |
| Newsletter | newsletter | light / dark |

## Colour / type tokens (reference for Figma variables)

```
precision-white #FBF5E3   macuna-purple #2B0512   day-orange #FFA91F
night-purple  #B46BA3    support-green #83B881
Display  Bitter 300   Product/wordmark  Fraunces 600
Body     Hanken Grotesk 300   Labels  Hanken Grotesk 700 +11% tracking
Radius  card 28px / button 999px   Container 1280 / gutter 24
```

## Handoff to dev

Each Figma layer name already equals the Liquid file / section id. Dev copies section markup 1:1; swap Figma image slots for licensed assets; set `mcp.*` metafields; publish.
