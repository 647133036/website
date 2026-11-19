import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { useCart } from '../lib/cart.jsx';
import { CartDrawer } from './shop.jsx';

export function StudioShell({ children }) {
  const { user, role, logout } = useAuth();
  const { count, setOpen } = useCart();
  const nav = useNavigate();
  const doLogout = () => { logout(); nav('/login'); };
  const initials = (user?.name || '?').slice(0, 1).toUpperCase();
  return (
    <div className="app">
      <div className="topbar">
        <div className="logo"><span className="pod" /> MacuDopa <span style={{ fontWeight: 400, opacity: .8, fontSize: 13, marginLeft: 2 }}>Wireframe Studio</span></div>
        <nav>
          <NavLink to="/studio" className={({ isActive }) => (isActive ? 'active' : '')}>Studio</NavLink>
          <NavLink to="/preview" className={({ isActive }) => (isActive ? 'active' : '')}>Preview</NavLink>
          <NavLink to="/shop" className={({ isActive }) => (isActive ? 'active' : '')}>Shop</NavLink>
          {role === 'admin' && <NavLink to="/orders" className={({ isActive }) => (isActive ? 'active' : '')}>Orders</NavLink>}
          {role === 'admin' && <NavLink to="/products" className={({ isActive }) => (isActive ? 'active' : '')}>Products</NavLink>}
          {role === 'admin' && <NavLink to="/groups" className={({ isActive }) => (isActive ? 'active' : '')}>Groups</NavLink>}
          {role === 'admin' && <NavLink to="/users" className={({ isActive }) => (isActive ? 'active' : '')}>Users</NavLink>}
        </nav>
        <div className="spacer" />
        <button className="cart-btn" onClick={() => setOpen(true)} title="Cart">
          <span>Cart</span>
          <span className="cart-count">{count}</span>
        </button>
        <div className="user-chip">
          <span className="avatar">{initials}</span>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 700 }}>{user?.name}</div>
            <div style={{ fontSize: 11, opacity: .8 }}>{user?.group || '—'}</div>
          </div>
          <span className="badge">{role}</span>
          <button className="btn ghost sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }} onClick={doLogout}>Sign out</button>
        </div>
      </div>
      <div className="main">{children}</div>
      <CartDrawer />
    </div>
  );
}
