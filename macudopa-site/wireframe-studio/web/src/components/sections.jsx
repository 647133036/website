import { useEffect, useState } from 'react';
import { ProductGrid, RecommendationsView, fetchProducts } from './shop.jsx';
import { resolveProps } from '../lib/sections.js';

const TONE = { orange: ['#FFA91F', '#fff3df'], green: ['#83B881', '#eef7ef'], purple: ['#B46BA3', '#f6eef6'], white: ['#FBF5E3', '#fff'] };

function Banner({ p }) {
  return (
    <div style={{ textAlign: 'center', padding: '22px 0' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--purple)' }}>{p.title}</div>
      <div className="pcard-meta" style={{ marginTop: 6 }}>{p.sub}</div>
    </div>
  );
}

function Header({ p }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
      <div style={{ fontWeight: 800, color: 'var(--purple)' }}>{p.brand}</div>
      <nav style={{ display: 'flex', gap: 14, fontSize: 13, flex: 1, flexWrap: 'wrap' }}>
        {(p.nav || []).map((n, i) => <span key={i} style={{ color: 'var(--muted)' }}>{n}</span>)}
      </nav>
      <button className="btn accent sm">{p.cta}</button>
    </div>
  );
}

function Hero({ p }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 20, alignItems: 'center' }}>
      <div>
        <div className="pcard-meta" style={{ letterSpacing: 1, textTransform: 'uppercase', color: 'var(--orange)' }}>{p.eyebrow}</div>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: 'var(--purple)', margin: '8px 0' }}>{p.headline}</h1>
        <p className="pcard-meta">{p.subhead}</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button className="btn primary">{p.ctaPrimary}</button>
          <button className="btn">{p.ctaSecondary}</button>
        </div>
      </div>
      <img src={p.image} alt="" style={{ width: '100%', borderRadius: 14, maxHeight: 240, objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
    </div>
  );
}

function Stats({ p }) {
  const rows = (p.stats || []).map((s) => { const [label, val] = s.split('='); return { label, val }; });
  return (
    <div>
      <h3 style={{ fontSize: 16, color: 'var(--purple)' }}>{p.title}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 8 }}>
        {rows.map((s, i) => (
          <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 12, background: '#faf7f0', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--orange)' }}>{s.val}</div>
            <div className="pcard-meta" style={{ fontSize: 12 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Cards({ p, accent }) {
  const items = (p.cards || []).map((c) => { const [t, b] = c.split('|'); return { t, b }; });
  return (
    <div>
      <h3 style={{ fontSize: 16, color: 'var(--purple)', marginBottom: 8 }}>{p.title}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + items.length + ',1fr)', gap: 10 }}>
        {items.map((c, i) => (
          <div key={i} style={{ border: '1px solid var(--line)', borderLeft: '4px solid ' + accent, borderRadius: 10, padding: 14, background: '#fff' }}>
            <b style={{ color: 'var(--ink)' }}>{c.t}</b>
            <p className="pcard-meta" style={{ margin: '6px 0 0', fontSize: 13 }}>{c.b}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Timeline({ p }) {
  const pts = (p.points || []).map((s) => { const [t, l] = s.split('|'); return { t, l }; });
  return (
    <div>
      <h3 style={{ fontSize: 16, color: 'var(--purple)' }}>{p.title}</h3>
      <p className="pcard-meta" style={{ margin: '6px 0 10px' }}>{p.intro}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {pts.map((x, i) => (
          <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 999, padding: '6px 12px', fontSize: 13 }}>
            <b style={{ color: 'var(--orange)' }}>{x.t}</b> <span className="pcard-meta">{x.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Quote({ p }) {
  return (
    <div style={{ border: '1px solid var(--line)', borderLeft: '4px solid var(--green)', borderRadius: 10, padding: 18, background: '#f6faf6' }}>
      <div style={{ fontSize: 16, fontStyle: 'italic', color: 'var(--ink)' }}>“{p.quote}”</div>
      <div className="pcard-meta" style={{ marginTop: 8, fontSize: 13 }}>— {p.author}</div>
    </div>
  );
}

function Newsletter({ p }) {
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 18, background: 'var(--white)', textAlign: 'center' }}>
      <b style={{ color: 'var(--purple)' }}>{p.title}</b>
      <p className="pcard-meta" style={{ margin: '6px 0 12px' }}>{p.blurb}</p>
      <div style={{ display: 'flex', gap: 8, maxWidth: 320, margin: '0 auto' }}>
        <input placeholder="you@email.com" style={{ flex: 1, padding: 9, borderRadius: 9, border: '1px solid var(--line)' }} />
        <button className="btn accent">Join</button>
      </div>
    </div>
  );
}

function Footer({ p }) {
  return (
    <div style={{ borderTop: '1px solid var(--line)', padding: '16px 0', fontSize: 12, color: 'var(--muted)' }}>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 8 }}>
        {(p.cols || []).map((c, i) => <span key={i}>{c}</span>)}
      </div>
      <div>{p.note}</div>
    </div>
  );
}

function Accordion({ p }) {
  const [open, setOpen] = useState(0);
  const qa = (p.items || []).map((s) => { const [q, a] = s.split('='); return { q, a }; });
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
      {qa.map((x, i) => (
        <div key={i} style={{ borderBottom: i < qa.length - 1 ? '1px solid var(--line)' : 'none' }}>
          <button onClick={() => setOpen(open === i ? -1 : i)} style={{ width: '100%', textAlign: 'left', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
            {x.q} <span style={{ color: 'var(--orange)' }}>{open === i ? '−' : '+'}</span>
          </button>
          {open === i && <div style={{ padding: '0 14px 12px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{x.a}</div>}
        </div>
      ))}
    </div>
  );
}

function SupportStrip({ p }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, border: '1px solid var(--line)', borderRadius: 12, padding: 16, background: '#fbf3ff' }}>
      <div style={{ flex: 1 }}>
        <b style={{ color: 'var(--purple)' }}>{p.title}</b>
        <p className="pcard-meta" style={{ margin: '4px 0 0', fontSize: 13 }}>{p.body}</p>
      </div>
      <button className="btn primary">{p.cta}</button>
    </div>
  );
}

function PageHero({ p }) {
  return (
    <div style={{ padding: '18px 0' }}>
      <div className="pcard-meta" style={{ letterSpacing: 1, textTransform: 'uppercase', color: 'var(--orange)' }}>{p.eyebrow}</div>
      <h1 style={{ fontSize: 30, fontWeight: 800, color: 'var(--purple)', margin: '6px 0' }}>{p.headline}</h1>
      <p className="pcard-meta">{p.subhead}</p>
    </div>
  );
}

function StorySplit({ p }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'center' }}>
      <div>
        <h3 style={{ fontSize: 18, color: 'var(--purple)' }}>{p.title}</h3>
        <p className="pcard-meta" style={{ lineHeight: 1.7, marginTop: 8 }}>{p.body}</p>
      </div>
      <img src={p.image} alt="" style={{ width: '100%', borderRadius: 12, maxHeight: 200, objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
    </div>
  );
}

function Recs({ p }) {
  return <div><h3 style={{ fontSize: 16, color: 'var(--purple)', margin: '6px 0' }}>{p.title}</h3><RecommendationsView /></div>;
}

function LiveGrid() {
  const [products, setProducts] = useState([]);
  useEffect(() => { (async () => { try { setProducts(await fetchProducts()); } catch (e) { /* noop */ } })(); }, []);
  if (!products.length) return <div className="spin">Loading products…</div>;
  return <ProductGrid products={products} onOpen={() => {}} />;
}

const RENDERERS = {
  header: Header, hero: Hero, 'timing-stats': Stats, 'support-cards': (p) => <Cards p={p} accent="#83B881" />,
  'continuum-timeline': Timeline, testimonial: Quote, newsletter: Newsletter, footer: Footer,
  'shop-banner': Banner, 'product-grid': LiveGrid, 'product-page': LiveGrid,
  'product-recommendations': Recs, 'page-hero': PageHero, 'faq-accordion': Accordion,
  'support-strip': SupportStrip, 'values-grid': (p) => <Cards p={p} accent="#B46BA3" />, 'story-split': StorySplit
};

// Render one block by its section + stored props (defaults merged in).
export function SectionRenderer({ block, onOpenProduct }) {
  const meta = resolveProps(block.section, block.props);
  const R = RENDERERS[block.section];
  if (!R) {
    return (
      <div style={{ border: '1px dashed var(--line)', borderRadius: 10, padding: 16 }}>
        <div style={{ fontWeight: 700 }}>{block.label || block.section}</div>
        <div className="pcard-meta" style={{ fontSize: 12 }}>Custom block · {block.section}</div>
      </div>
    );
  }
  return <R p={meta} />;
}
