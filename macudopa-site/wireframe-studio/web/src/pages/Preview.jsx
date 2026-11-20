import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { SectionRenderer } from '../components/sections.jsx';

export function PreviewPage() {
  const [pages, setPages] = useState([]);
  const [slug, setSlug] = useState('home');
  const [frame, setFrame] = useState('1440');
  const [page, setPage] = useState(null);

  const load = async (s, f) => {
    const j = await api(`/wireframes/${s}`);
    setPage(j);
    setFrame(f);
  };
  useEffect(() => { api('/wireframes').then(setPages); }, []);
  useEffect(() => { if (slug) load(slug, frame); }, [slug, frame]);

  return (
    <div className="admin">
      <h1>Preview</h1>
      <p style={{ color: 'var(--muted)' }}>Read-only, content-filled render of the selected wireframe. Hidden blocks are excluded.</p>
      <div className="toolbar">
        <div className="seg-toggle">
          {pages.map((p) => <button key={p.slug} className={p.slug === slug ? 'on' : ''} onClick={() => setSlug(p.slug)}>{p.title}</button>)}
        </div>
        <div className="seg-toggle">
          <button className={frame === '390' ? 'on' : ''} onClick={() => setFrame('390')}>Mobile 390</button>
          <button className={frame === '1440' ? 'on' : ''} onClick={() => setFrame('1440')}>Desktop 1440</button>
        </div>
      </div>
      <div style={{ maxWidth: frame === '390' ? 390 : 900, margin: '0 auto' }}>
        <div className="device" style={{ padding: 14 }}>
          <div className="screen" style={{ minHeight: 420 }}>
            {(page?.frames[frame] || []).filter((b) => b.visible).map((b) => <SectionRenderer key={b.id} block={b} />)}
            {(page?.frames[frame] || []).length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Empty frame</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
