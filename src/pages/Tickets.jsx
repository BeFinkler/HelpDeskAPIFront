import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useResource } from '../hooks/useResource';
import { categoryLabels, priorityLabels, statusLabels } from '../utils/format';
import { PageHeading, Loading, ErrorMessage, EmptyState, Pagination } from '../components/ui';
import TicketTable from '../components/TicketTable';

export default function Tickets() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const query = new URLSearchParams(params);
  query.set('limite', '10');
  const { result, error, loading, reload } = useResource(`/chamados?${query}`);
  const technician = user.perfil === 'tecnico';
  const filtered = ['busca', 'status', 'prioridade', 'categoria', 'meus'].some(key => params.has(key));
  const submit = event => {
    event.preventDefault();
    const next = new URLSearchParams();
    for (const [key, value] of new FormData(event.currentTarget)) if (value.trim()) next.set(key, value.trim());
    setParams(next);
  };
  return <>
    <PageHeading eyebrow="ACOMPANHE CADA ETAPA" title={technician ? 'Central de chamados' : 'Meus chamados'} description={technician ? 'Organize a fila e encontre o próximo atendimento.' : 'Todas as suas solicitações, com o andamento sempre à vista.'}>
      {!technician && <Link className="button button-primary" to="/chamados/novo"><Plus size={18} />Novo chamado</Link>}
    </PageHeading>
    <section className="panel"><form className="filters" onSubmit={submit} key={params.toString()} aria-label="Filtrar chamados"><div className="filter-search"><Search size={19} /><input name="busca" type="search" aria-label="Buscar por título ou protocolo" placeholder="Buscar por título ou protocolo..." defaultValue={params.get('busca') || ''} maxLength={160} /></div><div className="filter-options"><SlidersHorizontal size={17} aria-hidden="true" />
      <select name="status" aria-label="Filtrar por status" defaultValue={params.get('status') || ''}><option value="">Todos os status</option>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select>
      <select name="prioridade" aria-label="Filtrar por prioridade" defaultValue={params.get('prioridade') || ''}><option value="">Prioridades</option>{Object.entries(priorityLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select>
      <select name="categoria" aria-label="Filtrar por categoria" defaultValue={params.get('categoria') || ''}><option value="">Categorias</option>{Object.entries(categoryLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select>
      {technician && <label className="checkbox-label"><input type="checkbox" name="meus" value="true" defaultChecked={params.get('meus') === 'true'} />Meus atendimentos</label>}
      <button className="button button-secondary button-small" type="submit">Filtrar</button>{filtered && <button className="icon-button" type="button" aria-label="Limpar filtros" onClick={() => setParams({})}><X size={17} /></button>}
    </div></form>
      {loading ? <Loading label="Buscando chamados..." /> : error ? <div className="panel-padding"><ErrorMessage error={error} onRetry={reload} /></div> : result?.data.length ? <><TicketTable tickets={result.data} technician={technician} /><Pagination meta={result.meta} onChange={page => { const next = new URLSearchParams(params); next.set('pagina', String(page)); setParams(next); }} /></> : <EmptyState title={filtered ? 'Nenhum resultado encontrado' : 'Nenhum chamado por aqui'} description={filtered ? 'Experimente outro termo ou ajuste os filtros.' : technician ? 'Os novos pedidos aparecerão aqui.' : 'Abra um chamado quando precisar de ajuda.'}>{filtered ? <button className="button button-secondary" onClick={() => setParams({})}>Limpar filtros</button> : !technician && <Link className="button button-primary" to="/chamados/novo">Abrir chamado</Link>}</EmptyState>}
    </section>
  </>;
}
