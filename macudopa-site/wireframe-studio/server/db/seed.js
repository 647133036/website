const db = require('./index');
const { hashPassword } = require('../config/auth');

function seed() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  if (count > 0) {
    console.log('DB already seeded, skipping.');
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

  console.log('Seeded: groups=%d users=%d pages=%d blocks=%d', groups.length, users.length, pages.length, sectionMap && 0);
  console.log('Login seeds: admin@macudopa.com / admin123  |  design@macudopa.com / design123  |  view@macudopa.com / view123');
}

seed();
