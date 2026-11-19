import { useAuth, can } from '../auth.jsx';

export function Spinner() {
  return <div className="spin"><div>…loading</div></div>;
}

export function Guard({ need, children }) {
  const { role } = useAuth();
  if (!can(role, need)) return <div className="admin card">You need the <b>{need}</b> role to view this page.</div>;
  return children;
}

export function Toast({ msg }) {
  if (!msg) return null;
  return <div className="toast">{msg}</div>;
}
