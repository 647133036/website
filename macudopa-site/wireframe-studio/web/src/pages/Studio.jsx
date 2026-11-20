import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { sectionMeta, SECTIONS, resolveProps } from '../lib/sections.js';
import { useAuth, can } from '../auth.jsx';
import { Toast } from '../components/ui.jsx';
import { SectionRenderer } from '../components/sections.jsx';

function FieldInput({ field, value, onChange }) {
  const set = (v) => onChange(v);
  if (field.type === 'textarea') return <textarea value={value} onChange={(e) => set(e.target.value)} style={{ width: '100%', minHeight: 60, borderRadius: 8, border: '1px solid var(--line)', padding: 8 }} />;
  if (field.type === 'list') {
    const txt = Array.isArray(value) ? value.join('\n') : (value || '');
    return <textarea value={txt} onChange={(e) => set(e.target.value.split('\n').filter((x) => x.trim()))} placeholder="one item per line" style={{ width: '100%', minHeight: 60, borderRadius: 8, border: '1px solid var(--line)', padding: 8 }} />;
  }
  if (field.type === 'kvList') {
    const txt = Array.isArray(value) ? value.join('\n') : (value || '');
    return <textarea value={txt} onChange={(e) => set(e.target.value.split('\n').filter((x) => x.trim()))} placeholder="label=value (one per line)" style={{ width: '100%', minHeight: 80, borderRadius: 8, border: '1px solid var(--line)', padding: 8 }} />;
  }
  if (field.type === 'grid') {
    const txt = Array.isArray(value) ? value.join('\n') : (value || '');
    return <textarea value={txt} onChange={(e) => set(e.target.value.split('\n').filter((x) => x.trim()))} placeholder="title|body (one per line)" style={{ width: '100%', minHeight: 80, borderRadius: 8, border: '1px solid var(--line)', padding: 8 }} />;
  }
  if (field.type === 'image') return <input value={value} onChange={(e) => set(e.target.value)} placeholder="/img/… or a URL" style={{ width: '100%', borderRadius: 8, border: '1px solid var(--line)', padding: 8 }} />;
  return <input value={value} onChange={(e) => set(e.target.value)} style={{ width: '100%', borderRadius: 8, border: '1px solid var(--line)', padding: 8 }} />;
}

export function StudioPage() {
  const { role } = useAuth();
  const nav = useNavigate();
  const editable = can(role, 'editor');
  const isAdmin = role === 'admin';

  const [pages, setPages] = useState([]);
  const [slug, setSlug] = useState('home');
  const [frame, setFrame] = useState('1440');
  const [blocks, setBlocks] = useState([]);
  const [pageTitle, setPageTitle] = useState('');
  const [pageDesc, setPageDesc] = useState('');
  const [sel, setSel] = useState(null);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 2200); };

  const loadPages = async () => {
    const ps = await api('/wireframes');
    setPages(ps);
    if (!ps.find((p) => p.slug === slug) && ps[0]) setSlug(ps[0].slug);
  };

  const loadBlocks = async (s) => {
    setLoading(true);
    try {
      const j = await api(`/wireframes/${s}`);
      setSlug(s);
      setPageTitle(j.title);
      setPageDesc(j.description);
      setBlocks(j.frames[frame] || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPages(); }, []);
  useEffect(() => { if (slug) loadBlocks(slug); }, [slug, frame]);

  const refresh = async () => { await loadPages(); await loadBlocks(slug); };

  const addBlock = async (section) => {
    await api(`/wireframes/${slug}/blocks`, { method: 'POST', body: { frame, section, label: sectionMeta(section).label } });
    flash('Block added');
    refresh();
  };
  const updateBlock = async (id, patch) => {
    await api(`/wireframes/${slug}/blocks/${id}`, { method: 'PUT', body: patch });
    flash('Saved');
    refresh();
  };
  const toggleVis = async (id) => {
    const j = await api(`/wireframes/${slug}/blocks/${id}/visibility`, { method: 'PATCH', body: {} });
    setBlocks((cur) => cur.map((b) => (b.id === id ? j : b)));
    flash(j.visible ? 'Shown' : 'Hidden');
  };
  const delBlock = async (id) => {
    await api(`/wireframes/${slug}/blocks/${id}`, { method: 'DELETE' });
    flash('Removed');
    refresh();
  };
  const reorder = async (list) => {
    const order = list.map((b) => b.id);
    await api(`/wireframes/${slug}/reorder`, { method: 'PUT', body: { frame, order } });
    setBlocks(list);
  };
  const move = (from, to) => {
    if (to < 0 || to >= blocks.length || from === to) return;
    const arr = [...blocks];
    const [it] = arr.splice(from, 1);
    arr.splice(to, 0, it);
    reorder(arr);
  };

  const addPage = async () => {
    const t = prompt('New page title?');
    if (!t) return;
    const s = t.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-');
    try {
      const j = await api('/wireframes', { method: 'POST', body: { slug: s, title: t } });
      flash('Page created');
      await loadPages();
      setSlug(j.slug);
    } catch (e) { flash(e.message); }
  };
  const delPage = async () => {
    if (!confirm(`Delete page "${slug}"?`)) return;
    await api(`/wireframes/${slug}`, { method: 'DELETE' });
    flash('Page deleted');
    await loadPages();
    const ps = pages.slice(1);
    setSlug(ps[0]?.slug || 'home');
  };

  return (
    <div className="studio">
      <div className="sidelab">
        <h3>Pages</h3>
        {pages.map((p) => (
          <button key={p.slug} className={`pill ${p.slug === slug ? 'active' : ''}`} onClick={() => setSlug(p.slug)}>
            <span>{p.title}</span><span className="meta">{p.blockCount} blocks</span>
          </button>
        ))}
        {isAdmin && <button className="btn sm" style={{ width: '100%', marginTop: 8 }} onClick={addPage}>+ New page</button>}
        {isAdmin && <button className="btn danger sm" style={{ width: '100%', marginTop: 6 }} onClick={delPage}>Delete this page</button>}
      </div>

      <div className="canvas">
        <div className="canvas-head">
          <div>
            <div className="pt">{pageTitle}</div>
            {pageDesc && <div className="pd">{pageDesc}</div>}
          </div>
          <div className="frame-tabs">
            <button className={frame === '390' ? 'active' : ''} onClick={() => setFrame('390')}>Mobile 390</button>
            <button className={frame === '1440' ? 'active' : ''} onClick={() => setFrame('1440')}>Desktop 1440</button>
          </div>
        </div>

        {loading ? <div className="spin">Loading…</div> : (
          <div className="canvas-wrap">
            <div className="blocks-rail">
              <div className="canvas-head" style={{ marginBottom: 10 }}>
                <div className="pt" style={{ fontSize: 15 }}>{editable ? 'Blocks' : 'Blocks (read-only)'}</div>
                {editable && (
                  <select className="btn sm" style={{ marginLeft: 'auto' }} defaultValue="" onChange={(e) => { if (e.target.value) addBlock(e.target.value); e.target.value = ''; }}>
                    <option value="">+ Add section…</option>
                    {Object.keys(SECTIONS).filter((k) => !blocks.some((b) => b.section === k)).map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                )}
              </div>
              <div className="block-list">
                {blocks.map((b, i) => (
                  <div key={b.id} className={`block-item ${sel === b.id ? 'selected' : ''}`} onClick={() => setSel(b.id)}>
                    <div className="block-row">
                      <span className="grip" title="Drag to reorder" onClick={(e) => e.stopPropagation()}>{'\u2016'}</span>
                      <div className="bn">{b.label || b.section}<small>{b.section}</small></div>
                      {editable && (
                        <>
                          <button className="icon-btn" title="Up" onClick={(e) => { e.stopPropagation(); move(i, i - 1); }}>&uarr;</button>
                          <button className="icon-btn" title="Down" onClick={(e) => { e.stopPropagation(); move(i, i + 1); }}>&darr;</button>
                          <button className="icon-btn" title={b.visible ? 'Hide' : 'Show'} onClick={(e) => { e.stopPropagation(); toggleVis(b.id); }}>{b.visible ? '\u25CF' : '\u25CB'}</button>
                          <button className="icon-btn" title="Delete" onClick={(e) => { e.stopPropagation(); delBlock(b.id); }}>×</button>
                        </>
                      )}
                    </div>
                    {sel === b.id && editable && (
                      <div className="block-body" onClick={(e) => e.stopPropagation()}>
                        <div className="prop"><label>Section (Liquid id)</label><input value={b.section} onChange={(e) => updateBlock(b.id, { section: e.target.value })} /></div>
                        <div className="prop"><label>Label</label><input value={b.label} onChange={(e) => updateBlock(b.id, { label: e.target.value })} /></div>
                        {sectionMeta(b.section).fields.map((f) => {
                          const cur = resolveProps(b.section, b.props)[f.key];
                          return (
                            <div className="prop" key={f.key}>
                              <label>{f.label}</label>
                              <FieldInput field={f} value={cur} onChange={(v) => updateBlock(b.id, { props: { ...(b.props || {}), [f.key]: v } })} />
                            </div>
                          );
                        })}
                        {sectionMeta(b.section).fields.length === 0 && (
                          <div className="prop" style={{ fontSize: 12, color: 'var(--muted)' }}>{b.section === 'product-grid' || b.section === 'product-page' ? 'Live module — content comes from your products.' : 'No editable fields for this module yet.'}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {blocks.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>No blocks in this frame yet.</div>}
              </div>
            </div>

            <div className="preview">
              <div className={`device ${frame === '390' ? 'm' : 'd'}`}>
                <div className="screen">
                  {blocks.map((b) => (
                    <div key={b.id} className={`block-frame ${b.visible ? '' : 'hidden'}`}>
                      <div className="bf-tag">{sectionMeta(b.section).label} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>· {b.section}</span></div>
                      <SectionRenderer block={b} onOpenProduct={() => nav('/shop')} />
                    </div>
                  ))}
                  {blocks.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Empty frame</div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Toast msg={toast} />
    </div>
  );
}

