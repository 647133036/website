import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { SectionRenderer } from '../components/sections.jsx';

// A full content page driven by a wireframe page's blocks (real rendered
// sections, not placeholders). Used by /faq, /our-story, /home.
export function PageDetail({ slug: slugProp }) {
  const params = useParams();
  const slug = slugProp || params.slug;
  const nav = useNavigate();
  const [frame] = useState('1440');
  const [page, setPage] = useState(null);

  useEffect(() => { if (slug) api(`/wireframes/${slug}`).then(setPage).catch(() => setPage(null)); }, [slug]);

  if (!page) return <div className="admin"><div className="spin">Loading page…</div></div>;
  const blocks = (page.frames[frame] || []).filter((b) => b.visible);
  return (
    <div className="admin" style={{ maxWidth: 900, margin: '0 auto' }}>
      <button className="btn ghost sm" onClick={() => nav('/preview')}>← Back to preview</button>
      <div style={{ padding: '8px 4px' }}>
        {blocks.map((b) => <SectionRenderer key={b.id} block={b} />)}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
        <Link to="/faq" className="btn sm">FAQs</Link>
        <Link to="/our-story" className="btn sm">Our Story</Link>
        <Link to="/shop" className="btn accent sm">Shop</Link>
      </div>
    </div>
  );
}
