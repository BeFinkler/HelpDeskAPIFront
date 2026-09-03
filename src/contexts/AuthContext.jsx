import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, session } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const logout = useCallback(() => {
    session.clear(); setUser(null); setStatus('anonymous'); setError('');
  }, []);
  useEffect(() => {
    const expired = () => { logout(); setError('Sua sessão expirou. Entre novamente.'); };
    window.addEventListener('helpdesk:unauthorized', expired);
    return () => window.removeEventListener('helpdesk:unauthorized', expired);
  }, [logout]);
  useEffect(() => {
    if (!session.get()) { setStatus('anonymous'); return; }
    const controller = new AbortController();
    setStatus('loading');
    api('/auth/me', { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) { setUser(data); setStatus('authenticated'); setError(''); } })
      .catch(failure => {
        if (controller.signal.aborted) return;
        if (failure.status === 401) { logout(); setError('Sua sessão expirou. Entre novamente.'); }
        else { setStatus('unavailable'); setError(failure.message); }
      });
    return () => controller.abort();
  }, [revision, logout]);
  const login = async (email, senha) => {
    const { data } = await api('/auth/login', { method: 'POST', body: { email, senha }, anonymous: true });
    session.set(data.token); setUser(data.user); setStatus('authenticated'); setError('');
  };
  return <AuthContext.Provider value={{ user, status, error, login, logout, retry: () => setRevision(value => value + 1) }}>{children}</AuthContext.Provider>;
}

// O hook é exportado junto ao contexto para manter o uso da sessão centralizado.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
