import { createContext, useContext, useState, useEffect } from 'react';
import { auth, saveTokens, clearTokens, getTokens } from './lib/api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

const RANK = { viewer: 1, editor: 2, admin: 3 };
export function can(role, need) {
  return (RANK[role] || 0) >= (RANK[need] || 0);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = getTokens();
      if (!t.accessToken) {
        setLoading(false);
        return;
      }
      try {
        const { user } = await auth.me();
        setUser(user);
      } catch (e) {
        clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const j = await auth.login({ email, password });
    saveTokens(j);
    setUser(j.user);
    return j.user;
  };
  const register = async (name, email, password) => {
    const j = await auth.register({ name, email, password });
    saveTokens(j);
    setUser(j.user);
    return j.user;
  };
  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, role: user?.role || 'viewer' }}>
      {children}
    </Ctx.Provider>
  );
}
