import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Toast } from '../components/ui.jsx';

const STATUSES = { paid: 'Paid', pending: 'Pending', declined: 'Declined' };

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ orders: 0, revenue: 0 });
  const [open, setOpen] = useState(null);
  const [toast, setToast] = useState('');
  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 2000); };

  const load = async () => {
    const [o, s] = await Promise.all([api('/orders'), api('/orders/stats')]);
    setOrders(o); setStats(s);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (ref, status) => {
    // admin note: mark status by re-listing; we keep a client-side override map
    const list = orders.map((o) => (o.ref === ref ? { ...o, status } : o));
    setOrders(list);
    flash(`Order ${ref} → ${status}`);
  };

  return (
    <div className="admin">
      <h1>Orders</h1>
      <div className="grid2" style={{ marginBottom: 16 }}>
        <div className="card"><div className="sub light">Orders</div><div style={{ fontSize: 28, fontWeight: 800 }}>{stats.orders}</div></div>
        <div className="card"><div className="sub light">Revenue</div><div style={{ fontSize: 28, fontWeight: 800 }}>£{Number(stats.revenue).toFixed(2)}</div></div>
      </div>
      <div className="card">
        {orders.length === 0 && <p className="pcard-meta">No orders yet. Place one from the Shop to see it here.</p>}
        {orders.map((o) => (
          <div className="row" key={o.id}>
            <div className="who"><b>{o.ref}</b><small>{o.items.length} item(s) · {o.createdAt}</small></div>
            <span className={`tag ${o.status === 'paid' ? 'admin' : 'viewer'}`}>{STATUSES[o.status] || o.status}</span>
            <div style={{ minWidth: 90, textAlign: 'right' }}>£{Number(o.total).toFixed(2)}</div>
            <button className="btn sm" onClick={() => setOpen(open === o.ref ? null : o.ref)}>{open === o.ref ? 'Hide' : 'View'}</button>
          </div>
        ))}
        {open && (
          <div style={{ padding: '14px 4px', background: '#faf7f0', borderRadius: 10 }}>
            <b>{open} — line items</b>
            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
              {orders.find((o) => o.ref === open)?.items.map((it, i) => (
                <li key={i}>{it.qty}× {it.name} {it.variantLabel ? `(${it.variantLabel})` : ''} — £{Number(it.unitPrice).toFixed(2)}</li>
              ))}
            </ul>
            <div style={{ fontSize: 13 }}>Payment: {(orders.find((o) => o.ref === open)?.payment.method || 'card').toUpperCase()} · last4 {orders.find((o) => o.ref === open)?.payment.last4}</div>
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              {['paid', 'pending', 'declined'].map((s) => <button key={s} className={`btn sm ${orders.find((o) => o.ref === open)?.status === s ? 'primary' : 'ghost'}`} onClick={() => setStatus(open, s)}>{STATUSES[s]}</button>)}
            </div>
          </div>
        )}
      </div>
      <Toast msg={toast} />
    </div>
  );
}
