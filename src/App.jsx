import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import NewTicket from './pages/NewTicket';
import TicketDetail from './pages/TicketDetail';
import { Link } from 'react-router-dom';

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  return <Routes>
    <Route path="/login" element={<AuthPage key="login" />} />
    <Route path="/cadastro" element={<AuthPage key="cadastro" register />} />
    <Route element={<ProtectedRoute />}><Route element={<Layout key={user?.id} />}>
      <Route index element={<Navigate to="/painel" replace />} />
      <Route path="/painel" element={<Dashboard />} />
      <Route path="/chamados" element={<Tickets />} />
      <Route path="/chamados/novo" element={<NewTicket />} />
      <Route path="/chamados/:id" element={<TicketDetail key={location.pathname} />} />
      <Route path="*" element={<div className="not-found"><span>404</span><h1>Este caminho não foi encontrado</h1><p>Volte ao seu painel para continuar.</p><Link className="button button-primary" to="/painel">Ir para o painel</Link></div>} />
    </Route></Route>
  </Routes>;
}
