import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

function Card({ children }) {
  return <div className="auth"><div className="logo" style={{ fontSize: 22, fontWeight: 800, color: 'var(--purple)' }}><span style={{ display: 'inline-block', width: 22, height: 30, background: 'var(--orange)', borderRadius: '50% 50% 50% 50%/58% 58% 42% 42%', verticalAlign: 'middle', marginRight: 8 }} />MacuDopa</div>{children}</div>;
}

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@macudopa.com');
  const [password, setPassword] = useState('admin123');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await login(email, password); nav('/', { replace: true }); }
    catch (x) { setErr(x.message); }
    finally { setBusy(false); }
  };
  return (
    <Card>
      <h1>Sign in</h1>
      <p className="sub">Access the MacuDopa wireframe studio</p>
      <form onSubmit={submit}>
        <div className="field"><label>Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="field"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        <div className="err">{err}</div>
        <button className="btn primary" style={{ width: '100%' }} disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <div className="toggle">No account? <a onClick={() => nav('/register')}>Register</a></div>
    </Card>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await register(name, email, password); nav('/', { replace: true }); }
    catch (x) { setErr(x.message); }
    finally { setBusy(false); }
  };
  return (
    <Card>
      <h1>Create account</h1>
      <p className="sub">New accounts join the Viewers group by default</p>
      <form onSubmit={submit}>
        <div className="field"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div className="field"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="field"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
        <div className="err">{err}</div>
        <button className="btn primary" style={{ width: '100%' }} disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <div className="toggle">Already have one? <a onClick={() => nav('/login')}>Sign in</a></div>
    </Card>
  );
}

