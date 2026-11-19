import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Toast } from '../components/ui.jsx';

const ROLES = ['admin', 'editor', 'viewer'];

export function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ name: '', role: 'viewer', description: '' });
  const [toast, setToast] = useState('');
  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 2000); };

  const load = async () => setGroups(await api('/groups'));
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      await api('/groups', { method: 'POST', body: form });
      flash('Group created');
      setForm({ name: '', role: 'viewer', description: '' });
      load();
    } catch (x) { flash(x.message); }
  };
  const upd = async (g) => {
    try { await api(`/groups/${g.id}`, { method: 'PUT', body: g }); flash('Saved'); load(); }
    catch (x) { flash(x.message); }
  };
  const del = async (id) => {
    if (!confirm('Delete this group? Its members will be ungrouped.')) return;
    await api(`/groups/${id}`, { method: 'DELETE' });
    flash('Group deleted');
    load();
  };

  return (
    <div className="admin">
      <h1>User groups</h1>
      <p style={{ color: 'var(--muted)' }}>Each group carries a role that controls what members can do in the studio.</p>

      <div className="card">
        <form onSubmit={add} className="grid2" style={{ gap: 12 }}>
          <div className="field"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="field">
            <label>Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="field" style={{ gridColumn: 'span 2' }}><label>Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        </form>
        <button className="btn primary" onClick={(e) => { e.preventDefault(); add(e); }}>Create group</button>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        {groups.map((g) => (
          <div className="row" key={g.id}>
            <div className="who"><b>{g.name}</b><small>{g.description || '—'} · {g.members} member(s)</small></div>
            <span className={`tag ${g.role}`}>{g.role}</span>
            <select value={g.role} onChange={(e) => upd({ ...g, role: e.target.value })} style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '6px 8px' }}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button className="btn danger sm" onClick={() => del(g.id)}>Delete</button>
          </div>
        ))}
      </div>
      <Toast msg={toast} />
    </div>
  );
}
