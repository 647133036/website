export const SECTIONS = {
  header: { label: 'Header', desc: 'Sticky header + mobile drawer (logo, nav, account, cart)' },
  hero: { label: 'Hero', desc: 'Split hero: eyebrow, headline, subhead, buttons' },
  'timing-stats': { label: 'Timing / Stats', desc: 'On-and-on stat blocks' },
  'support-cards': { label: 'Support Cards', desc: 'Day / Night / Routine cards' },
  'continuum-timeline': { label: 'Continuum Timeline', desc: '24h On/Fade/Off band + doses' },
  testimonial: { label: 'Testimonial', desc: 'Quote block' },
  newsletter: { label: 'Newsletter', desc: 'Email capture' },
  footer: { label: 'Footer', desc: '4-col footer + socials' },
  'shop-banner': { label: 'Shop Banner', desc: 'Collection banner' },
  'product-grid': { label: 'Product Grid', desc: 'Filter / sort / product cards' },
  'product-page': { label: 'Product Page', desc: 'PDP media + info + add-to-cart' },
  'product-recommendations': { label: 'Recommendations', desc: 'Recommended products' },
  'page-hero': { label: 'Page Hero', desc: 'Inner-page header strip' },
  'faq-accordion': { label: 'FAQ Accordion', desc: 'Single-open FAQ' },
  'support-strip': { label: 'Support Strip', desc: 'Practitioner-guided CTA' },
  'values-grid': { label: 'Values Grid', desc: 'Innovative / Optimistic / Empowering' },
  'story-split': { label: 'Story Split', desc: 'Origin text + botanical panel' }
};

export function sectionMeta(name) {
  return SECTIONS[name] || { label: name, desc: 'Custom block' };
}
