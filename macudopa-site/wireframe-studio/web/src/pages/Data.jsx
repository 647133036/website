import { useState } from 'react';
import { api } from '../lib/api.js';
import { Toast } from '../components/ui.jsx';

const DS = [
  { key: 'products', label: 'Products' },
  { key: 'orders', label: 'Orders' },
  { key: 'wireframes', label: 'Wireframes' },
  { key: 'users', label: 'Users & groups' }
];

export function DataPage() {
  const [sel, setSel] = useState(['products']);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const toggle = (k) => setSel((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  const flash = (m, ok) => { setMsg(ok ? m : '⚠ ' + m); setTimeout(() => setMsg(''), 3500); };

  const doExport = async (format, datasets) => {
    const ds = datasets && datasets.length ? datasets : sel;
    if (ds.length === 0) return flash('Pick at least one dataset to export.', false);
    setBusy(true);
    try {
      const url = `/api/data/export?datasets=${ds.join(',')}&format=${format}`;
      const tok = localStorage.getItem('mf_tokens') ? JSON.parse(localStorage.getItem('mf_tokens')).accessToken : '';
      const r = await fetch(url, { headers: { Authorization: `Bearer ${tok}` } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const blob = await r.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `macudopa-${ds.join('-')}.${format}`;
      a.click();
      URL.revokeObjectURL(a.href);
      flash(`Exported ${ds.join(', ')} as ${format.toUpperCase()}.`, true);
    } catch (e) {
      flash('Export failed: ' + e.message, false);
    } finally {
      setBusy(false);
    }
  };

  const doImport = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const j = await api('/data/import', { method: 'POST', body: parsed, rawField: 'payload', auth: true });
      const c = j.counts || {};
      const parts = Object.entries(c).map(([k, v]) => (typeof v === 'object' ? `${k}=(${v.pages || 0} pages, ${v.blocks || 0} blocks, ${v.users || 0} users)` : `${k}=${v}`));
      flash(`Imported: ${parts.join(', ') || 'data'}.`, true);
    } catch (e) {
      flash('Import failed: ' + (e.message || 'invalid file'), false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin" style={{ maxWidth: 620, margin: '0 auto' }}>
      <h1>Data import / export</h1>
      <p className="sub light" style={{ marginTop: -4 }}>Move products, orders, wireframe blocks and users in & out. JSON keeps full fidelity (variants, galleries, detail, props); CSV is for tabular products/orders only.</p>

      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DS.map((d) => (
            <label key={d.key} className={`radio ${sel.includes(d.key) ? 'on' : ''}`}>
              <input type="checkbox" checked={sel.includes(d.key)} onChange={() => toggle(d.key)} />
              <span>{d.label}</span>
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <button className="btn primary" disabled={busy || sel.length === 0} onClick={() => doExport('json')}>Export JSON</button>
          <button className="btn" disabled={busy || sel.length === 0} onClick={() => doExport('csv')}>Export CSV</button>
          <button className="btn" disabled={busy} onClick={() => doExport('json', DS.map((d) => d.key))}>Download all (JSON)</button>
        </div>
        <p className="pcard-meta" style={{ marginTop: 10 }}>JSON export includes everything and is what Import expects. CSV export is a flat tabular dump. "Download all" grabs every dataset in one file.</p>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h3 style={{ marginTop: 0 }}>Import</h3>
        <p className="pcard-meta">Upload a JSON export. Existing records are matched by key (product slug, order ref, page slug, group/user email) and upserted.</p>
        <input type="file" accept="application/json,.json" onChange={(e) => doImport(e.target.files && e.target.files[0])}
          style={{ display: 'block', margin: '10px 0', padding: 10, border: '1px dashed var(--line)', borderRadius: 10 }} />
      </div>

      {msg && <div style={{ marginTop: 14, padding: 10, borderRadius: 10, background: msg.startsWith('⚠') ? '#fdecec' : '#e7f6ea', color: msg.startsWith('⚠') ? '#a11' : '#1a5', fontSize: 13 }}>{msg}</div>}
      <Toast msg={''} />
    </div>
  );
}
