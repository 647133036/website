// Section catalog: each block type has a label, a short desc, and a props schema
// (ordered fields with type + default). The editor builds a dynamic form from
// `fields`; the renderer reads the same keys. One source of truth.

export const SECTIONS = {
  header: {
    label: 'Header', desc: 'Sticky header + mobile drawer (logo, nav, account, cart)',
    fields: [
      { key: 'brand', type: 'text', label: 'Brand name', def: 'MacuDopa' },
      { key: 'nav', type: 'list', label: 'Nav links (one per line)', def: ['Shop', 'Our Story', 'FAQs'] },
      { key: 'cta', type: 'text', label: 'CTA label', def: 'Shop now' }
    ]
  },
  hero: {
    label: 'Hero', desc: 'Split hero: eyebrow, headline, subhead, buttons',
    fields: [
      { key: 'eyebrow', type: 'text', label: 'Eyebrow', def: 'Natural Parkinson’s support' },
      { key: 'headline', type: 'text', label: 'Headline', def: 'Stay on, not off.' },
      { key: 'subhead', type: 'textarea', label: 'Subhead', def: 'Mucuna pruriens, precisely dosed and independently checked — so the daytime holds.' },
      { key: 'ctaPrimary', type: 'text', label: 'Primary button', def: 'Shop MacuDopa' },
      { key: 'ctaSecondary', type: 'text', label: 'Secondary button', def: 'How it works' },
      { key: 'image', type: 'image', label: 'Hero image', def: '/img/hero.jpeg' }
    ]
  },
  'timing-stats': {
    label: 'Timing / Stats', desc: 'On-and-on stat blocks',
    fields: [
      { key: 'title', type: 'text', label: 'Section title', def: 'All day, all on' },
      { key: 'stats', type: 'kvList', label: 'Stats (label=number)', def: ['On-time response=9 in 10', 'Fewer off-periods=+2h steady', 'Independently checked=HPLC std'] }
    ]
  },
  'support-cards': {
    label: 'Support Cards', desc: 'Day / Night / Routine cards',
    fields: [
      { key: 'title', type: 'text', label: 'Section title', def: 'Built around your on-and-off' },
      { key: 'cards', type: 'grid', label: 'Cards (title|body)', def: ['MacuDopa Day|Fast-acting daytime bridge', 'MacuDopa Night|Smooths the morning dip', 'The Routine|Your 24h plan with your team'] }
    ]
  },
  'continuum-timeline': {
    label: 'Timeline',
    desc: 'The 24-hour support band across the day.',
    defaults: { title: 'Support across the day', items: [
      '7:00=Morning — take Day capsule with food to support energy and dopaminergic tone.',
      '12:00=Midday — continue routine; Day supports consistency through the afternoon.',
      '18:00=Evening — switch to Night for recovery and sleep quality.',
      '23:00=Rest — Night supports overnight recovery so you start the next day steadier.'
    ] },
    fields: [
      { key: 'title', type: 'text', label: 'Heading', def: 'Support across the day' },
      { key: 'items', type: 'kvList', label: 'Time steps (time=label)', def: [] }
    ]
  },
  testimonial: {
    label: 'Testimonial', desc: 'Quote block',
    fields: [
      { key: 'quote', type: 'textarea', label: 'Quote', def: 'For the first time the afternoon isn’t a lottery. I plan around my day instead of around the off-periods.' },
      { key: 'author', type: 'text', label: 'Author', def: 'Lena, lives with PD, 58' }
    ]
  },
  newsletter: {
    label: 'Newsletter', desc: 'Email capture',
    fields: [
      { key: 'title', type: 'text', label: 'Title', def: 'Get practitioner updates' },
      { key: 'blurb', type: 'text', label: 'Blurb', def: 'Dosing tips and new research, monthly. No noise.' }
    ]
  },
  footer: {
    label: 'Footer', desc: '4-col footer + socials',
    fields: [
      { key: 'note', type: 'textarea', label: 'Disclaimer', def: 'MacuDopa is a supplement. Do not stop prescribed medication. Work with your care team.' },
      { key: 'cols', type: 'list', label: 'Footer columns (one per line)', def: ['Shop', 'Support', 'Company', 'Legal'] }
    ]
  },
  'shop-banner': {
    label: 'Shop Banner', desc: 'Collection banner',
    fields: [
      { key: 'title', type: 'text', label: 'Title', def: 'Shop MacuDopa' },
      { key: 'sub', type: 'text', label: 'Sub', def: 'Day, Night and complete bundles — 30-day guarantee.' }
    ]
  },
  'product-grid': {
    label: 'Product Grid', desc: 'Filter / sort / product cards (live)',
    fields: []
  },
  'product-page': {
    label: 'Product Page', desc: 'PDP media + info + add-to-cart (live)',
    fields: []
  },
  'product-recommendations': {
    label: 'Recommendations', desc: 'Recommended products (live)',
    fields: [
      { key: 'title', type: 'text', label: 'Title', def: 'Pairs well with' }
    ]
  },
  'page-hero': {
    label: 'Page Hero', desc: 'Inner-page header strip',
    fields: [
      { key: 'eyebrow', type: 'text', label: 'Eyebrow', def: 'FAQs' },
      { key: 'headline', type: 'text', label: 'Headline', def: 'Answers, without the jargon' },
      { key: 'subhead', type: 'textarea', label: 'Subhead', def: 'Everything about dosing, timing and safety — straight.' }
    ]
  },
  'faq-accordion': {
    label: 'FAQs',
    desc: 'Single-open accordion of the most-asked questions.',
    defaults: { title: 'FAQs', items: [
      'What is MacuDopa Day and Night?', 'MacuDopa Day is a daytime blend (Mucuna pruriens L-5 + BF12 + B6 + B9 + B12) that supports dopamine availability and energy. Night supports recovery and sleep with the same botanical backbone.',
      'How does Mucuna pruriens support PD?', 'Mucuna pruriens is a rich natural source of L-DOPA (5-10% by dry weight). In PD, dopaminergic neurons degenerate and L-DOPA is the substrate the brain can still convert to dopamine, which is why it is a standard PD therapy.',
      'What is BF12 and why is it included?', 'BF12 is a proprietary blend of bioavailable B-complex forms. B12, B9 (folate) and B6 support homocysteine metabolism and neurological function — useful supporting nutrition for PD diets that restrict protein.',
      'When should I take it?', 'Day in the morning with food; Night in the evening. Always take alongside — never instead of — your prescribed medication.',
      'Is this a cure?', 'No. MacuDopa is a food supplement and natural support. It is not a medicine, does not treat or cure PD, and must not replace prescribed medication.',
      'Who is it for?', 'Adults living with early-to-mid Parkinson’s disease or at risk, who want evidence-informed natural support alongside medical care.'
    ] },
    fields: [
      { key: 'title', type: 'text', label: 'Heading', def: 'FAQs' },
      { key: 'items', type: 'list', label: 'Q&A pairs (question=answer)', def: [] }
    ]
  },
  'support-strip': {
    label: 'Support Strip', desc: 'Practitioner-guided CTA',
    fields: [
      { key: 'title', type: 'text', label: 'Title', def: 'Guided, not guesswork' },
      { key: 'body', type: 'textarea', label: 'Body', def: 'Work with your GP or neurologist. We supply the evidence, they set your plan.' },
      { key: 'cta', type: 'text', label: 'CTA', def: 'Talk to your practitioner' }
    ]
  },
  'values-grid': {
    label: 'Values',
    desc: 'Innovative / Optimistic / Empowering pillars.',
    defaults: { title: 'What we stand for', items: [
      'Innovative=We pair plant science with clean-laboratory isolation, so what you take is standardised and traceable.',
      'Optimistic=Living with PD is a long journey. We make it more manageable, one steady day at a time.',
      'Empowering=We give you the information to talk to your GP with confidence — without replacing your doctor.'
    ] },
    fields: [
      { key: 'title', type: 'text', label: 'Heading', def: 'What we stand for' },
      { key: 'items', type: 'grid', label: 'Pillars (title=body)', def: [] }
    ]
  },
  'story-split': {
    label: 'Story Split', desc: 'Origin text + botanical panel',
    fields: [
      { key: 'title', type: 'text', label: 'Title', def: 'Where MacuDopa came from' },
      { key: 'body', type: 'textarea', label: 'Body', def: 'We started from one question: could a natural source of L-DOPA be dosed with the same precision as a drug? Mucuna pruriens, standardised and independently verified, let us say yes — and call it MacuDopa.' },
      { key: 'image', type: 'image', label: 'Image', def: '/img/hero.jpeg' }
    ]
  }
};

export function sectionMeta(name) {
  return SECTIONS[name] || { label: name, desc: 'Custom block', fields: [] };
}

// Resolve a block's effective props: merge schema defaults with stored props.
export function resolveProps(section, props) {
  const out = {};
  const meta = SECTIONS[section];
  if (meta && meta.fields) {
    for (const f of meta.fields) out[f.key] = f.def;
  }
  if (props && typeof props === 'object') Object.assign(out, props);
  return out;
}
