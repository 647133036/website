import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const STATUSES = { paid: 'Paid', pending: 'Pending', declined: 'Declined' };

export function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(null);
  useEffect(() => { (async () => { try { setOrders(await api('/orders/mine')); } catch (e) { /* noop */ } })(); }, []);

  const exportCsv = () => {
    const rows = orders.map((o) => o.items.map((it) => ({ ref: o.ref, item: it.name, variant: it.variantLabel || it.variant, qty: it.qty, unit: it.unitPrice, status: o.status, total: o.total, date: o.createdAt })));
    const cols = ['ref', 'item', 'variant', 'qty', 'unit', 'status', 'total', 'date'];
    const csv = [cols.join(','), ...rows.map((r) => cols.map((k) => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `macudopa-my-orders.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="admin" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ flex: 1 }}>My orders</h1>
        <button className="btn sm" disabled={orders.length === 0} onClick={exportCsv}>Export CSV</button>
      </div>
      <div className="card">
        {orders.length === 0 && <p className="pcard-meta">You have no orders yet. Head to the <a href="#/shop">Shop</a> to place your first one.</p>}
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
              {orders.find((x) => x.ref === open)?.items.map((it, i) => (
                <li key={i}>{it.qty}× {it.name} {it.variantLabel ? `(${it.variantLabel})` : ''} — £{Number(it.unitPrice).toFixed(2)}</li>
              ))}
            </ul>
            <div style={{ fontSize: 13 }}>Payment: {(orders.find((x) => x.ref === open)?.payment.method || 'card').toUpperCase()} · last4 {orders.find((x) => x.ref === open)?.payment.last4}</div>
          </div>
        )}
      </div>
    </div>
  );
}
