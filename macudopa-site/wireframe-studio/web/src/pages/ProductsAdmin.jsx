import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Toast } from '../components/ui.jsx';

const EMPTY = { slug: '', name: '', price: 0, compare_price: '', category: 'day', tone: 'orange', formula: 'Mucuna pruriens HPLC std + BF12', meta: '', badge: '', description: '', stock: 100, active: true, variants: [] };

function variantText(v) {
  return (v || []).map((x) => `${x.id}:${x.label}(${x.delta})`).join(' | ');
}
function parseVariants(str) {
  if (!str) return [];
  return str.split('|').map((s) => {
    const m = s.match(/^(.*):(.*)\((-?\d+)\)$/);
    if (m) return { id: m[1], label: m[2], delta: Number(m[3]) };
    return null;
  }).filter(Boolean);
}

export function ProductsAdmin() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState('');
  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 2000); };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const load = async () => setList(await api('/products'));
  useEffect(() => { load(); }, []);

  const create = () => { setForm({ ...EMPTY }); setEditingId(null); };
  const edit = (p) => {
    setForm({ ...p, variantsText: variantText(p.variants), compare_price: p.comparePrice ?? '' });
    setEditingId(p.id);
  };
  const save = async () => {
    const payload = {
      name: form.name, price: Number(form.price), compare_price: form.compare_price === '' ? null : Number(form.compare_price),
      category: form.category, tone: form.tone, formula: form.formula, meta: form.meta,
      badge: form.badge || null, description: form.description, stock: Number(form.stock), active: !!form.active,
      variants: parseVariants(form.variantsText)
    };
    if (editingId) {
      const p = list.find((x) => x.id === editingId);
      await api('/products/' + p.slug, { method: 'PUT', body: payload });
      flash('Product updated');
    } else {
      await api('/products', { method: 'POST', body: { slug: form.slug || payload.name, ...payload } });
      flash('Product created');
    }
    setForm(null); setEditingId(null); load();
  };
  const remove = async (slug) => {
    if (!confirm(`Delete ${slug}?`)) return;
    await api('/products/' + slug, { method: 'DELETE' });
    flash('Deleted'); load();
  };

  return (
    <div className="admin">
      <div className="canvas-head">
        <div><div className="pt">Products</div><div className="pd">Manage the MacuDopa catalogue (admin).</div></div>
        <button className="btn primary" onClick={create} style={{ marginLeft: 'auto' }}>+ New product</button>
      </div>

      {form && (
        <div className="card" style={{ marginBottom: 14, borderLeft: '3px solid var(--orange)' }}>
          <div className="grid2">
            {!editingId && <div className="field"><label>Slug</label><input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="macudopa-x" /></div>}
            <div className="field"><label>Name</label><input value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
            <div className="field"><label>Price (£)</label><input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} /></div>
            <div className="field"><label>Compare price</label><input type="number" value={form.compare_price} onChange={(e) => set('compare_price', e.target.value)} /></div>
            <div className="field"><label>Category</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)}>
                <option value="day">Day</option><option value="night">Night</option><option value="bundle">Bundle</option>
              </select>
            </div>
            <div className="field"><label>Tone</label>
              <select value={form.tone} onChange={(e) => set('tone', e.target.value)}>
                <option value="orange">Orange</option><option value="purple">Purple</option><option value="green">Green</option>
              </select>
            </div>
            <div className="field"><label>Stock</label><input type="number" value={form.stock} onChange={(e) => set('stock', e.target.value)} /></div>
            <div className="field"><label>Badge</label><input value={form.badge} onChange={(e) => set('badge', e.target.value)} placeholder="Best value / New / …" /></div>
          </div>
          <div className="field"><label>Meta</label><input value={form.meta} onChange={(e) => set('meta', e.target.value)} /></div>
          <div className="field"><label>Description</label><textarea rows="2" value={form.description} onChange={(e) => set('description', e.target.value)} /></div>
          <div className="field"><label>Formula</label><input value={form.formula} onChange={(e) => set('formula', e.target.value)} /></div>
          <div className="field"><label>Variants — format: id:Label(delta) | id:Label(delta) | …</label>
            <input value={form.variantsText || ''} onChange={(e) => set('variantsText', e.target.value)} placeholder="single:One-off(0) | sub:Subscribe & save(-10)" /></div>
          <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} /> Active (visible in shop)</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn primary" onClick={save}>{editingId ? 'Save changes' : 'Create product'}</button>
            <button className="btn ghost" onClick={() => { setForm(null); setEditingId(null); }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        {list.map((p) => (
          <div className="row" key={p.id}>
            <div className="who"><b>{p.name}</b><small>{p.slug} · {p.category} · stock {p.stock}</small></div>
            <span className="tag viewer">£{Number(p.price).toFixed(2)}</span>
            {!p.active && <span className="tag viewer">hidden</span>}
            <button className="btn sm" onClick={() => edit(p)}>Edit</button>
            <button className="btn danger sm" onClick={() => remove(p.slug)}>Delete</button>
          </div>
        ))}
      </div>
      <Toast msg={toast} />
    </div>
  );
}
