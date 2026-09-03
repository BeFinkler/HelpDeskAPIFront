import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loading, ErrorMessage } from '../components/ui';

export default function ProtectedRoute() {
  const { status, error, retry, logout } = useAuth();
  const location = useLocation();
  if (status === 'loading')
    return (
      <div className="screen-center">
        <Loading label="Preparando seu espaço..." />
      </div>
    );
  if (status === 'unavailable')
    return (
      <div className="screen-center">
        <div className="session-card">
          <h1>Não foi possível carregar sua sessão</h1>
          <ErrorMessage error={error} onRetry={retry} />
          <button className="button button-secondary" onClick={logout}>
            Voltar ao login
          </button>
        </div>
      </div>
    );
  return status === 'authenticated' ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  );
}
