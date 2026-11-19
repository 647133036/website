import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { sectionMeta } from '../lib/sections.js';

function PreviewBlock({ block }) {
  const meta = sectionMeta(block.section);
  if (!block.visible) return null;
  return (
    <div className="block-frame">
      <div className="bf-tag">{meta.label} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>· {block.section}</span></div>
      <div className="bf-box">{block.label || meta.desc}</div>
    </div>
  );
}

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
      <p style={{ color: 'var(--muted)' }}>Read-only render of the selected wireframe. Hidden blocks are excluded.</p>
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
            {(page?.frames[frame] || []).map((b) => <PreviewBlock key={b.id} block={b} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
