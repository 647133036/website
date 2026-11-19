# MacuDopa — Design Brief

Maps the Mother London re-brand (MacuDopa brand toolkit v1.0) onto the pre-existing wireframes, for build-out into Shopify Liquid / Horizon templates. This brief is the design-system source of truth: colour, type, spacing, components and the Figma handoff note. A matching working prototype lives at `/workspace/macudopa-site/` (preview link delivered separately).

## 1. Positioning

MacuDopa is Parkinson's support grown from nature and refined by science. The brand balances two worlds, natural medicine and predictable performance, and reads as calm, precise, warm and human. It should feel like a considered, premium apothecary, with clinical credibility but no clinical coldness.

## 2. Colour

Core brand palette (from toolkit p.20). For on-screen use, type is restricted to **Precision White** or **Macuna Purple** for legibility.

| Token | Name | Hex | CMYK | Use |
|---|---|---|---|---|
| `precision-white` | Precision White | `#FBF5E3` | C0 M2 Y10 K2 | Page background, light text |
| `macuna-purple` | Macuna Purple | `#2B0512` | C0 M88 Y58 K83 | Primary type, dark sections, buttons |
| `day-orange` | Day Orange | `#FFA91F` | C0 M34 Y88 K0 | Day formula accent, CTA, section labels |
| `night-purple` | Night Purple | `#B46BA3` | C0 M41 Y9 K29 | Night formula accent, secondary accent |
| `support-green` | Support Green | `#83B881` | C29 M0 Y30 K28 | "On" state, trust, botanical |

Contrast pairing rules (toolkit p.21–22):
- Precision White on Macuna Purple (or vice versa) is the primary legible pair.
- Day Orange and Night Purple are the two formula accents; do not use them together on the same text/logo block.
- Never mix product colours (orange + green) on one element.
- Over imagery, keep text in a core colour; if contrast fails, tint the image with ~30% of a contrasting core colour.

Accessibility note: Macuna Purple `#2B0512` on Precision White `#FBF5E3` = ~15:1 contrast (AAA). Day Orange `#FFA91F` on Macuna Purple = ~4.8:1 (AA, ok for large text / labels). Support Green is decorative only, never body text.

## 3. Typography

The toolkit uses three families (p.25). Two are commercial; for the build we use the listed web-safe stand-ins and keep the commercial families as the "final" target once licensed.

| Role | Toolkit family | Build stand-in | Spec |
|---|---|---|---|
| Display / Titles | Caslon Ionic Rounded | **Bitter 300** (or license Caslon Ionic Rounded, Light) | Light, sentence case, tracking 0, leading 130% |
| Product titles / Wordmark | Memoir | **Fraunces 600** (free) | Regular, uppercase, tracking -2%, leading 90% |
| Body copy | TWK Lausanne 350 | **Hanken Grotesk 300** (or license TWK Lausanne 350) | Tracking 0, leading 130%, sentence case |
| Subtitles / labels | TWK Lausanne 700 | **Hanken Grotesk 700** | Uppercase, tracking +11%, leading 130% |

Type scale (responsive, 4-page build):

- Display heading: `clamp(2.4rem, 5.2vw, 4.4rem)`, Bitter 300, leading 1.05
- Section heading: `clamp(1.5rem, 3vw, 2.3rem)`, Bitter 300
- Product title: 1.25rem, Fraunces 600, uppercase, tracking -0.02em
- Subtitle/label: 12px, Hanken Grotesk 700, uppercase, tracking 0.11em
- Body: 17px / 1.3 base, Hanken Grotesk 300, line-height 1.55 in body blocks

Licensing flag (dev brief / client): Caslon Ionic Rounded (Commercial Type) and TWK Lausanne (Weltkern) require purchase before launch. Memoir is free. Ship the build on the free stand-ins; swap families in `settings_schema` once licenses are secured.

## 4. Graphic language

- Grids and infographics carry the scientific precision; keep keyline weights consistent (toolkit p.35).
- Icons: curved inner corners with sharp outer edges, echoing the logo/symbol. One consistent stroke weight.
- Botanical / graphic imagery: Mucuna scanned and colour-mapped against the core palette, X-ray quality, luminous and precise. Use as atmosphere, not as the hero subject.
- Logo mark: a Mucuna pod (pointed lens, two seed dots, stem) inside a circle. Minimum clear space = 50% of the mark height (toolkit p.12); wordmark clear space = 20% (p.10). Never rotate, outline, reverse or recolour the symbol separately from the wordmark.

## 5. Layout & breakpoints

- Container: 1280px max, 24px side padding.
- Breakpoints: 0–767 (mobile), 768–1023 (tablet), 1024+ (desktop).
- Section vertical rhythm: 96px mobile, 112px desktop.
- Cards: 28px radius; buttons: full pill (999px).
- Product grid: auto-fill, min 250px column, 24px gap.
- Header: sticky, 76px, translucent cream with blur, 1px hairline bottom.

## 6. Components

- **Header**: logo left; nav (Shop / FAQs / Our story) centre-left; account + cart icons right; hamburger drawer below 1024px.
- **Buttons**: Primary = Macuna Purple fill / Precision White text; Orange CTA = Day Orange fill / Macuna Purple text; Ghost = 1.5px Macuna Purple stroke. Hover: -2px lift + soft shadow.
- **Product card**: square visual (gradient per formula + inline bottle SVG), uppercase Fraunces title, meta line, price + "Add to cart" pill.
- **FAQ accordion**: single-open, Bitter question, animated "+" that becomes "×".
- **Continuum timeline**: 24-column band, On / Fade / Off segments + dose pills (Day orange / Night purple).
- **Newsletter**: email + pill submit, used in light section and dark footer.
- **Footer**: dark Macuna Purple; 4 columns (Brand + socials / About / Help / Stay in the loop); legal strip.

## 7. Page map

| Page | Key sections |
|---|---|
| Home | Hero (nature/science) → Find your timing (2 stats) → Day/Night/Routine cards → Continuum Method timeline → Testimonial → Newsletter |
| Shop | Banner → Filter chips + Sort → Product grid (4 products) → Newsletter |
| FAQs | Hero strip → Accordion (5) → Practitioner support CTA |
| Our Story | Hero (values) → 3 value cards → Origin + botanical panel → Practitioner guided CTA |

## 8. Figma handoff note

The wireframe source is the existing Figma file; this build realises it as a live responsive prototype (4 pages, mobile + desktop) so the brand mapping can be validated in-browser before dev. To move into Figma, reproduce each prototype section as a frame at 390× and 1440× widths using the tokens above, keeping the same section order and component names so Liquid sections map 1:1. Product imagery in the prototype uses inline SVG bottle mockups; swap for licensed packshots (toolkit p.45 royalty-free set) before launch. The homepage hero photo and lifestyle photo in `assets/img` are pulled from the toolkit and are marked "unlicensed" in the PDF, so they are placeholders pending licensing.
