const db = require('./index');
const { hashPassword } = require('../config/auth');

const IMG = {
  day:   ['/img/p40_1_1080x1350.jpeg', '/img/p40_4_1080x1350.jpeg', '/img/p40_6_1080x1350.jpeg', '/img/p41_4_1080x1350.jpeg'],
  night: ['/img/p41_0_736x920.jpeg', '/img/p41_7_736x920.jpeg', '/img/p43_0_1528x2000.jpeg'],
  bundle:['/img/p43_1_2752x1536.jpeg', '/img/p43_2_2752x1536.jpeg', '/img/p43_3_2752x1536.jpeg', '/img/p75_0_1920x1065.jpeg'],
  starter:['/img/p39_5_1200x1500.jpeg', '/img/p39_1_1200x900.jpeg', '/img/p40_0_1500x1875.jpeg'],
  detailBanner: '/img/detail-banner.jpeg'
};

function detailFor(p, images) {
  return [
    { type: 'banner', image: IMG.detailBanner, caption: p.meta },
    { type: 'headline', title: 'How it works', body: p.description },
    { type: 'list', title: 'What is inside', items: [
      'Mucuna pruriens — HPLC standardised, independently checked',
      'BF12 complex for absorption and stability',
      'Precise, measured L-DOPA dose per capsule'
    ] },
    { type: 'grid', title: 'The MacuDopa method', items: [
      { title: 'Fast-acting', body: 'Designed to bridge off-periods before they start.' },
      { title: 'On-and-on', body: 'Steadier daytime dopamine, fewer dips.' },
      { title: 'Practitioner-guided', body: 'Pair with your care team; never stop prescribed meds.' }
    ] },
    { type: 'guarantee', title: '30-day money-back guarantee', body: 'If it does not feel right, return it within 30 days for a full refund.' },
    { type: 'gallery', title: 'In the frame', images }
  ];
}

const PRODUCTS = [
  {
    slug: 'bundle-pd', name: 'Complete PD Bundle', price: 143.18, compare_price: null,
    category: 'bundle', tone: 'green', formula: 'Mucuna pruriens HPLC std + BF12',
    meta: 'Day + Night + Routine, 60-day supply', badge: 'Best value', stock: 25,
    description: 'Our full on-and-on range: MacuDopa Day, Night and the Routine program, sized for a 60-day supply. The most complete way to keep dopamine steady across the whole day.',
    gallery: IMG.bundle, detail: detailFor({ meta: 'Day + Night + Routine, 60-day supply', description: 'The most complete on-and-on system: day, night and a routine that keeps you steady all 24 hours.' }, IMG.bundle),
    variants: [
      { id: 'single', label: 'One-off', delta: 0 },
      { id: 'sub', label: 'Subscribe & save', delta: -10, note: 'Save £10 + free shipping' }
    ]
  },
  {
    slug: 'starter', name: 'Day + Night Starter Pack', price: 70.18, compare_price: 70,
    category: 'bundle', tone: 'green', formula: 'Mucuna pruriens HPLC std + BF12',
    meta: 'Start your on-and-on routine', badge: 'New', stock: 60,
    description: 'Begin the MacuDopa method with the Day and Night pair. Smooths the morning off-period and supports daytime control in one pack.',
    gallery: IMG.starter, detail: detailFor({ meta: 'Day + Night starter', description: 'Start with the Day and Night pair to smooth the morning off-period and support daytime control.' }, IMG.starter),
    variants: [
      { id: 'single', label: 'One-off', delta: 0 },
      { id: 'sub', label: 'Subscribe & save', delta: -5, note: 'Free shipping' }
    ]
  },
  {
    slug: 'macudopa-day', name: 'MacuDopa Day', price: 35.0, compare_price: null,
    category: 'day', tone: 'orange', formula: 'Mucuna pruriens HPLC std + BF12',
    meta: 'Daytime, fast-acting dopaminergic support', badge: null, stock: 120,
    description: 'Fast-acting daytime support built on L-DOPA from Mucuna pruriens. Take it just before your last dose fades to keep you on for longer.',
    gallery: IMG.day, detail: detailFor({ meta: 'Daytime, fast-acting', description: 'Fast-acting daytime support that bridges off-periods before they start.' }, IMG.day),
    variants: [
      { id: '30', label: '30 capsules', delta: 0 },
      { id: '60', label: '60 capsules', delta: 20 },
      { id: 'sub', label: 'Subscribe & save', delta: -4, note: '10% off + free shipping' }
    ]
  },
  {
    slug: 'macudopa-night', name: 'MacuDopa Night', price: 35.0, compare_price: null,
    category: 'night', tone: 'purple', formula: 'Mucuna pruriens HPLC std + BF12',
    meta: 'Overnight, smooths the morning off-period', badge: 'Coming soon', stock: 0,
    description: 'Overnight formula that bridges the pre-dawn dip so you wake up on, not off. Part of the MacuDopa Continuum Method.',
    gallery: IMG.night, detail: detailFor({ meta: 'Overnight', description: 'Bridges the pre-dawn dip so you wake up on, not off — part of the MacuDopa Continuum Method.' }, IMG.night),
    variants: [
      { id: '30', label: '30 capsules', delta: 0 },
      { id: '60', label: '60 capsules', delta: 20 },
      { id: 'sub', label: 'Subscribe & save', delta: -4, note: '10% off + free shipping' }
    ]
  }
];

function seedProducts() {
  const n = db.prepare('SELECT COUNT(*) AS n FROM products').get().n;
  if (n > 0) return n;
  const ins = db.prepare(`
    INSERT INTO products (slug, name, price, compare_price, category, tone, formula, meta, badge, description, stock, active, variants_json, gallery_json, detail_json)
    VALUES (@slug, @name, @price, @compare_price, @category, @tone, @formula, @meta, @badge, @description, @stock, 1, @variants_json, @gallery_json, @detail_json)
  `);
  for (const p of PRODUCTS) {
    ins.run({
      slug: p.slug, name: p.name, price: p.price, compare_price: p.compare_price,
      category: p.category, tone: p.tone, formula: p.formula, meta: p.meta,
      badge: p.badge, description: p.description, stock: p.stock,
      variants_json: JSON.stringify(p.variants),
      gallery_json: JSON.stringify(p.gallery || []),
      detail_json: JSON.stringify(p.detail || [])
    });
  }
  return db.prepare('SELECT COUNT(*) AS n FROM products').get().n;
}

function seed() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  if (count > 0) {
    const seeded = seedProducts();
    console.log('Users already seeded; products now =', seeded);
    return;
  }

  const groups = [
    { name: 'Founders', role: 'admin', description: 'Full control: users, groups, wireframes' },
    { name: 'Design Team', role: 'editor', description: 'Edit wireframes & blocks' },
    { name: 'Viewers', role: 'viewer', description: 'Read-only access to wireframes' }
  ];

  const insGroup = db.prepare('INSERT INTO user_groups (name, role, description) VALUES (?, ?, ?)');
  for (const g of groups) insGroup.run(g.name, g.role, g.description);

  const groupIds = db.prepare('SELECT id, name FROM user_groups').all();
  const byName = Object.fromEntries(groupIds.map((g) => [g.name, g.id]));

  const users = [
    { email: 'admin@macudopa.com', password: 'admin123', name: 'Founder Admin', group: byName['Founders'] },
    { email: 'design@macudopa.com', password: 'design123', name: 'Priya Design', group: byName['Design Team'] },
    { email: 'view@macudopa.com', password: 'view123', name: 'Stakeholder', group: byName['Viewers'] }
  ];

  const insUser = db.prepare('INSERT INTO users (email, password_hash, name, group_id) VALUES (?, ?, ?, ?)');
  for (const u of users) insUser.run(u.email, hashPassword(u.password), u.name, u.group);

  const pages = [
    { slug: 'home', title: 'Home', description: 'Hero, timing, support cards, continuum, testimonial, newsletter' },
    { slug: 'shop', title: 'Shop / Collection', description: 'Filterable, sortable product grid' },
    { slug: 'product', title: 'Product', description: 'PDP: media, variants, add-to-cart' },
    { slug: 'faq', title: 'FAQs', description: 'Accordion + practitioner CTA' },
    { slug: 'our-story', title: 'Our Story', description: 'Values, origin, botanical panel' }
  ];

  const insPage = db.prepare('INSERT INTO wireframe_pages (slug, title, description) VALUES (?, ?, ?)');
  for (const p of pages) insPage.run(p.slug, p.title, p.description);

  const sectionMap = {
    home: ['header', 'hero', 'timing-stats', 'support-cards', 'continuum-timeline', 'testimonial', 'newsletter', 'footer'],
    shop: ['header', 'shop-banner', 'product-grid', 'newsletter', 'footer'],
    product: ['header', 'product-page', 'product-recommendations', 'newsletter', 'footer'],
    faq: ['header', 'page-hero', 'faq-accordion', 'support-strip', 'footer'],
    'our-story': ['header', 'hero', 'values-grid', 'story-split', 'support-strip', 'footer']
  };

  const labelMap = {
    header: 'Sticky header + mobile drawer',
    hero: 'Split hero (eyebrow / headline / subhead / buttons)',
    'timing-stats': 'On-and-on stat blocks',
    'support-cards': 'Day / Night / Routine cards',
    'continuum-timeline': '24h symptom-control band',
    testimonial: 'Quote block',
    newsletter: 'Email capture',
    footer: '4-col footer + socials',
    'shop-banner': 'Collection banner',
    'product-grid': 'Filter / sort / product cards',
    'product-page': 'PDP media + info + add-to-cart',
    'product-recommendations': 'Recommended products',
    'page-hero': 'Inner-page header strip',
    'faq-accordion': 'Single-open FAQ',
    'support-strip': 'Practitioner-guided CTA',
    'values-grid': 'Innovative / Optimistic / Empowering',
    'story-split': 'Origin text + botanical panel'
  };

  const insBlock = db.prepare(`
    INSERT INTO wireframe_blocks (page_slug, frame, section_name, label, visible, order_idx, props_json)
    VALUES (?, ?, ?, ?, 1, ?, '{}')
  `);

  for (const slug of Object.keys(sectionMap)) {
    const sections = sectionMap[slug];
    for (const frame of ['390', '1440']) {
      sections.forEach((sec, i) => {
        insBlock.run(slug, frame, sec, labelMap[sec] || sec, i);
      });
    }
  }

  const pCount = seedProducts();

  console.log('Seeded: groups=%d users=%d pages=%d products=%d', groups.length, users.length, pages.length, pCount);
  console.log('Login seeds: admin@macudopa.com / admin123  |  design@macudopa.com / design123  |  view@macudopa.com / view123');
}

seed();
module.exports = { IMG, detailFor, PRODUCTS };
