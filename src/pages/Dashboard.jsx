import { Link } from 'react-router-dom';
import { ArrowRight, CheckCheck, CircleDot, Clock3, Plus, Ticket, Headphones } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useResource } from '../hooks/useResource';
import { PageHeading, ErrorMessage, Loading, EmptyState } from '../components/ui';
import TicketTable from '../components/TicketTable';

const cards = [
  {
    key: 'total',
    title: 'Todos os chamados',
    icon: Ticket,
    tone: 'violet',
    detail: 'Seu histórico de atendimento',
    link: '/chamados',
  },
  {
    key: 'ABERTO',
    title: 'Abertos',
    icon: CircleDot,
    tone: 'blue',
    detail: 'Aguardando atendimento',
    link: '/chamados?status=ABERTO',
  },
  {
    key: 'EM_ATENDIMENTO',
    title: 'Em atendimento',
    icon: Clock3,
    tone: 'amber',
    detail: 'Uma solução a caminho',
    link: '/chamados?status=EM_ATENDIMENTO',
  },
  {
    key: 'CONCLUIDO',
    title: 'Concluídos',
    icon: CheckCheck,
    tone: 'green',
    detail: 'Atendimentos finalizados',
    link: '/chamados?status=CONCLUIDO',
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const summary = useResource('/chamados/resumo');
  const recent = useResource('/chamados?limite=5');
  const technician = user.perfil === 'tecnico';
  return (
    <>
      <PageHeading
        eyebrow="SEU SUPORTE, EM UM SÓ LUGAR"
        title={`Olá, ${user.nome.split(' ')[0]} 👋`}
        description={
          technician
            ? 'Acompanhe a central e faça cada atendimento avançar.'
            : 'Veja o andamento dos seus chamados e encontre a ajuda de que precisa.'
        }
      >
        <Link
          className="button button-primary"
          to={technician ? '/chamados?status=ABERTO' : '/chamados/novo'}
        >
          {technician ? <Headphones size={18} /> : <Plus size={18} />}
          {technician ? 'Ver fila de atendimento' : 'Novo chamado'}
        </Link>
      </PageHeading>
      {summary.error ? (
        <ErrorMessage error={summary.error} onRetry={summary.reload} />
      ) : (
        <section className="stats-grid" aria-label="Resumo dos chamados">
          {cards.map(({ key, title, icon: Icon, tone, detail, link }) => (
            <Link className={`stat-card stat-${tone}`} to={link} key={key}>
              <div className="stat-card-top">
                <span>{title}</span>
                <span className="stat-icon">
                  <Icon size={19} />
                </span>
              </div>
              <strong>{summary.loading ? '—' : (summary.result?.data[key] ?? 0)}</strong>
              <span className="stat-detail">
                {technician && key === 'total' ? 'Todos os chamados da central' : detail}
              </span>
            </Link>
          ))}
        </section>
      )}
      <section className="welcome-banner">
        <div>
          <span className="banner-label">
            {technician ? 'FAÇA A FILA ANDAR' : 'PODEMOS AJUDAR?'}
          </span>
          <h2>
            {technician ? 'Uma boa solução começa com atenção.' : 'Um problema a menos no seu dia.'}
          </h2>
          <p>
            {technician
              ? 'Confira os chamados abertos, assuma um atendimento e mantenha o cliente por dentro.'
              : 'Descreva o que aconteceu. Nossa equipe acompanha você em cada etapa até a solução.'}
          </p>
          <Link to={technician ? '/chamados?meus=true' : '/chamados/novo'}>
            {technician ? 'Acessar meus atendimentos' : 'Abrir um chamado'}
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="banner-art" aria-hidden="true">
          <span className="banner-ring" />
          <Headphones size={62} strokeWidth={1.4} />
          <span className="banner-art-check">
            <CheckCheck size={20} />
          </span>
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Chamados recentes</h2>
            <p>
              {technician
                ? 'Os últimos pedidos que chegaram à central.'
                : 'Acompanhe suas solicitações mais recentes.'}
            </p>
          </div>
          <Link className="text-link" to="/chamados">
            Ver todos
            <ArrowRight size={16} />
          </Link>
        </div>
        {recent.loading ? (
          <Loading />
        ) : recent.error ? (
          <div className="panel-padding">
            <ErrorMessage error={recent.error} onRetry={recent.reload} />
          </div>
        ) : recent.result?.data.length ? (
          <TicketTable tickets={recent.result.data} technician={technician} />
        ) : (
          <EmptyState
            title={technician ? 'A fila está tranquila' : 'Seu próximo passo começa aqui'}
            description={
              technician
                ? 'Novos chamados aparecerão nesta central.'
                : 'Quando precisar de ajuda, abra um chamado e acompanhe tudo por aqui.'
            }
          >
            {!technician && (
              <Link className="button button-secondary" to="/chamados/novo">
                <Plus size={17} />
                Abrir chamado
              </Link>
            )}
          </EmptyState>
        )}
      </section>
      <div className="dashboard-note">
        <ShieldIcon />
        <p>
          {technician
            ? 'Atualize o atendimento e registre a solução para manter um histórico claro.'
            : 'As atualizações e respostas da equipe ficam registradas nos detalhes de cada chamado.'}
        </p>
      </div>
    </>
  );
}

function ShieldIcon() {
  return (
    <span className="note-symbol">
      <CheckCheck size={18} />
    </span>
  );
}
