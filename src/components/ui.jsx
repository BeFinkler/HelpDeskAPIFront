import { AlertCircle, ArrowLeft, ArrowRight, Inbox, LoaderCircle } from 'lucide-react';
import { statusLabels, priorityLabels } from '../utils/format';

export function Loading({ label = 'Carregando...' }) {
  return (
    <div className="loading-state" role="status">
      <LoaderCircle className="spin" size={24} />
      <span>{label}</span>
    </div>
  );
}

export function ErrorMessage({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="error-box" role="alert">
      <AlertCircle size={20} />
      <div>
        <p>{typeof error === 'string' ? error : error.message}</p>
        {onRetry && (
          <button type="button" className="text-button" onClick={onRetry}>
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  title = 'Nenhum chamado por aqui',
  description = 'Seus chamados aparecerão aqui.',
  children,
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Inbox size={30} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className={`badge status-${status}`}>
      <span className="status-dot" />
      {statusLabels[status] || status}
    </span>
  );
}
export function PriorityBadge({ priority }) {
  return (
    <span className={`priority priority-${priority}`}>
      <span className="priority-bars">
        <i />
        <i />
        <i />
      </span>
      {priorityLabels[priority] || priority}
    </span>
  );
}

export function Pagination({ meta, onChange }) {
  if (!meta?.total) return null;
  const from = (meta.pagina - 1) * meta.limite + 1;
  return (
    <div className="pagination">
      <span>
        {from}–{Math.min(meta.pagina * meta.limite, meta.total)} de {meta.total} registros
      </span>
      <div>
        <button
          className="icon-button"
          aria-label="Página anterior"
          disabled={meta.pagina <= 1}
          onClick={() => onChange(meta.pagina - 1)}
        >
          <ArrowLeft size={17} />
        </button>
        <span>
          Página {meta.pagina} de {meta.totalPaginas}
        </span>
        <button
          className="icon-button"
          aria-label="Próxima página"
          disabled={meta.pagina >= meta.totalPaginas}
          onClick={() => onChange(meta.pagina + 1)}
        >
          <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
}

export function Field({ label, name, error, hint, children }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {children}
      {hint && <small id={`${name}-hint`}>{hint}</small>}
      {error && (
        <small id={`${name}-error`} className="field-error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}

export function PageHeading({ eyebrow, title, description, children }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </div>
  );
}
