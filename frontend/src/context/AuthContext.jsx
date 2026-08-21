import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loginUser, registerUser, fetchMe } from '../api/auth.js';
import { parseApiError } from '../utils/apiError.js';

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('cih_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [initializing, setInitializing] = useState(true);

  const persist = (nextUser, token) => {
    setUser(nextUser);
    localStorage.setItem('cih_user', JSON.stringify(nextUser));
    if (token) localStorage.setItem('cih_token', token);
  };

  // On app load, trust the cached user for an instant paint, then silently
  // verify the token against the server -- if it is stale/expired, log out.
  useEffect(() => {
    const token = localStorage.getItem('cih_token');
    if (!token) {
      setInitializing(false);
      return;
    }
    fetchMe()
      .then(({ data }) => persist(data.user))
      .catch(() => {
        setUser(null);
        localStorage.removeItem('cih_token');
        localStorage.removeItem('cih_user');
      })
      .finally(() => setInitializing(false));
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await loginUser({ email, password });
      persist(data.user, data.token);
      return { ok: true };
    } catch (error) {
      return { ok: false, ...parseApiError(error) };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const { data } = await registerUser({ name, email, password });
      persist(data.user, data.token);
      return { ok: true };
    } catch (error) {
      return { ok: false, ...parseApiError(error) };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('cih_token');
    localStorage.removeItem('cih_user');
  }, []);

  // Lets pages that already fetched a fresh user object (e.g. after a
  // bookmark toggle) sync it back into context without a round trip.
  const updateUser = useCallback((nextUser) => persist(nextUser), []);

  const value = useMemo(
    () => ({ user, initializing, isAuthenticated: Boolean(user), login, register, logout, updateUser }),
    [user, initializing, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
