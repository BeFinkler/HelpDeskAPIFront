import { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import {
  Headphones,
  LayoutDashboard,
  Ticket,
  Plus,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { initials } from '../utils/format';

export function Logo({ light = false }) {
  return (
    <span className={`brand ${light ? 'brand-light' : ''}`}>
      <span className="brand-icon">
        <Headphones size={23} strokeWidth={2.2} />
      </span>
      <span>
        helpdesk<span className="brand-dot">.</span>
      </span>
    </span>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const technician = user.perfil === 'tecnico';
  const heading =
    location.pathname === '/painel'
      ? 'Visão geral'
      : location.pathname === '/chamados/novo'
        ? 'Novo chamado'
        : 'Chamados';
  return (
    <div className="app-layout">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <Link to="/painel" aria-label="HelpDesk, início" onClick={() => setOpen(false)}>
            <Logo />
          </Link>
          <button
            className="icon-button mobile-only"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>
        <div className="workspace-label">
          <span className="workspace-avatar">HD</span>
          <div>
            Central de suporte<small>{technician ? 'Espaço do técnico' : 'Área do cliente'}</small>
          </div>
        </div>
        <p className="nav-label">PRINCIPAL</p>
        <nav aria-label="Navegação principal" onClick={() => setOpen(false)}>
          <NavLink to="/painel">
            <LayoutDashboard size={19} />
            Visão geral
          </NavLink>
          <NavLink to="/chamados" end>
            <Ticket size={19} />
            {technician ? 'Central de chamados' : 'Meus chamados'}
          </NavLink>
          {!technician && (
            <NavLink to="/chamados/novo">
              <Plus size={19} />
              Novo chamado
            </NavLink>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-icon">
              <ShieldCheck size={21} />
            </span>
            <strong>{technician ? 'Cada atendimento importa' : 'Estamos aqui para ajudar'}</strong>
            <p>
              {technician
                ? 'Assuma um chamado e acompanhe cada etapa até a solução.'
                : 'Conte com a nossa equipe para resolver o que você precisa.'}
            </p>
            <Link to={technician ? '/chamados' : '/chamados/novo'} onClick={() => setOpen(false)}>
              {technician ? 'Ver fila de atendimento' : 'Abrir um chamado'}
              <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="sidebar-user">
            <span className="avatar">{initials(user.nome)}</span>
            <div>
              <strong>{user.nome}</strong>
              <small>{technician ? 'Técnico de suporte' : 'Cliente'}</small>
            </div>
            <button
              className="icon-button"
              title="Sair da conta"
              aria-label="Sair da conta"
              onClick={logout}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-only"
              aria-label="Abrir menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu />
            </button>
            <span className="breadcrumb">
              Central de suporte<span>/</span>
              <strong>{heading}</strong>
            </span>
          </div>
          <div className="topbar-right">
            <span className="profile-pill">{technician ? 'Área técnica' : 'Área do cliente'}</span>
            <span className="avatar avatar-small">{initials(user.nome)}</span>
          </div>
        </header>
        <main id="conteudo" className="page-content" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>HelpDesk · Central de suporte</span>
          <span>Um chamado. Uma solução.</span>
        </footer>
      </div>
    </div>
  );
}
