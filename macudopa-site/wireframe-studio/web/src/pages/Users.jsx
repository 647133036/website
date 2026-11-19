import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Toast } from '../components/ui.jsx';

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', groupId: '' });
  const [toast, setToast] = useState('');
  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 2000); };

  const load = async () => {
    const [u, g] = await Promise.all([api('/users'), api('/groups')]);
    setUsers(u); setGroups(g);
  };
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      await api('/users', { method: 'POST', body: form });
      flash('User added');
      setForm({ name: '', email: '', password: '', groupId: '' });
      load();
    } catch (x) { flash(x.message); }
  };
  const setGroup = async (id, gid) => {
    await api(`/users/${id}`, { method: 'PUT', body: { groupId: gid || null } });
    flash('Group updated');
    load();
  };
  const del = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await api(`/users/${id}`, { method: 'DELETE' }); flash('User deleted'); load(); }
    catch (x) { flash(x.message); }
  };

  return (
    <div className="admin">
      <h1>Users</h1>
      <p style={{ color: 'var(--muted)' }}>Create accounts and assign them to a group. A user inherits the group's role.</p>

      <div className="card">
        <form onSubmit={add} className="grid2" style={{ gap: 12 }}>
          <div className="field"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="field"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="field"><label>Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} /></div>
          <div className="field">
            <label>Group</label>
            <select value={form.groupId} onChange={(e) => setForm({ ...form, groupId: e.target.value })}>
              <option value="">— none (viewer) —</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.role})</option>)}
            </select>
          </div>
        </form>
        <button className="btn primary" onClick={(e) => { e.preventDefault(); add(e); }}>Add user</button>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        {users.map((u) => (
          <div className="row" key={u.id}>
            <div className="avatar" style={{ width: 34, height: 34 }}>{u.name.slice(0, 1).toUpperCase()}</div>
            <div className="who"><b>{u.name}</b><small>{u.email}</small></div>
            <span className={`tag ${u.role}`}>{u.role}</span>
            <select value={u.groupId || ''} onChange={(e) => setGroup(u.id, e.target.value)} style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '6px 8px' }}>
              <option value="">no group</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <button className="btn danger sm" onClick={() => del(u.id)}>Delete</button>
          </div>
        ))}
      </div>
      <Toast msg={toast} />
    </div>
  );
}
