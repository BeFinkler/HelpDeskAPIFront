import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Clock3,
  Headphones,
  LockKeyhole,
  MessageSquare,
  Pencil,
  Send,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useResource } from '../hooks/useResource';
import { api } from '../services/api';
import { protocol, categoryLabels, formatDate, initials } from '../utils/format';
import {
  Loading,
  ErrorMessage,
  StatusBadge,
  PriorityBadge,
  Field,
  Pagination,
} from '../components/ui';
import TicketForm from '../components/TicketForm';

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const ticket = useResource(`/chamados/${id}`);
  const [commentPage, setCommentPage] = useState(1);
  const comments = useResource(`/chamados/${id}/comentarios?pagina=${commentPage}&limite=20`);
  const [mode, setMode] = useState('view');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState(null);
  const [notice, setNotice] = useState(
    location.state?.created ? 'Chamado aberto! Acompanhe seu atendimento por aqui.' : '',
  );
  const resolutionRef = useRef(null);
  useEffect(() => {
    if (mode === 'resolve') resolutionRef.current?.focus();
  }, [mode]);
  if (ticket.loading) return <Loading label="Carregando atendimento..." />;
  if (ticket.error)
    return (
      <>
        <Link className="back-link" to="/chamados">
          <ArrowLeft size={16} />
          Voltar aos chamados
        </Link>
        <ErrorMessage error={ticket.error} onRetry={ticket.reload} />
      </>
    );
  const data = ticket.result?.data;
  if (!data) return null;
  const responsible = user.perfil === 'tecnico' && data.tecnico_id === user.id;
  const owner = user.perfil === 'cliente' && data.cliente_id === user.id;
  const canComment = data.status !== 'CONCLUIDO' && (owner || responsible);
  const action = async (path, body, message, method = 'PATCH') => {
    if (busy) return false;
    setBusy(true);
    setFailure(null);
    setNotice('');
    try {
      await api(path, { method, body });
      setMode('view');
      setNotice(message);
      ticket.reload();
      comments.reload();
      return true;
    } catch (error) {
      setFailure(error);
      return false;
    } finally {
      setBusy(false);
    }
  };
  const conclude = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    action(
      `/chamados/${id}/status`,
      { status: 'CONCLUIDO', versao: data.versao, resolucao: form.get('resolucao') },
      'Atendimento concluído. A solução já está disponível para o cliente.',
    );
  };
  const comment = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = new FormData(form).get('mensagem');
    if (
      await action(
        `/chamados/${id}/comentarios`,
        { mensagem: message },
        'Comentário enviado.',
        'POST',
      )
    ) {
      form.reset();
      setCommentPage(Math.max(1, Math.ceil(((comments.result?.meta.total || 0) + 1) / 20)));
    }
  };
  return (
    <>
      <Link to="/chamados" className="back-link">
        <ArrowLeft size={16} />
        Voltar aos chamados
      </Link>
      <div className="detail-heading">
        <div>
          <div className="detail-overline">
            <span className="ticket-protocol">{protocol(data.id)}</span>
            <StatusBadge status={data.status} />
          </div>
          <h1>{data.titulo}</h1>
          <p>
            Aberto em {formatDate(data.criado_em)} · {categoryLabels[data.categoria]}
          </p>
        </div>
        <div className="page-actions">
          {owner && data.status === 'ABERTO' && mode === 'view' && (
            <button
              className="button button-secondary"
              disabled={busy}
              onClick={() => setMode('edit')}
            >
              <Pencil size={16} />
              Editar chamado
            </button>
          )}
          {user.perfil === 'tecnico' && data.status === 'ABERTO' && (
            <button
              className="button button-primary"
              disabled={busy}
              onClick={() =>
                action(
                  `/chamados/${id}/status`,
                  { status: 'EM_ATENDIMENTO', versao: data.versao },
                  'Atendimento assumido. Você é o responsável por este chamado.',
                )
              }
            >
              <Headphones size={17} />
              {busy ? 'Assumindo...' : 'Assumir chamado'}
            </button>
          )}
          {responsible && data.status === 'EM_ATENDIMENTO' && mode !== 'resolve' && (
            <button
              className="button button-primary"
              disabled={busy}
              onClick={() => setMode('resolve')}
            >
              <CheckCheck size={17} />
              Concluir atendimento
            </button>
          )}
        </div>
      </div>
      {notice && (
        <p className="success-box" role="status">
          <Check size={18} />
          {notice}
        </p>
      )}
      <ErrorMessage
        error={failure}
        onRetry={
          failure?.status === 409
            ? () => {
                setFailure(null);
                ticket.reload();
                comments.reload();
              }
            : undefined
        }
      />
      <div className="detail-grid">
        <div className="detail-main">
          {mode === 'edit' ? (
            <section className="panel">
              <div className="panel-heading">
                <h2>Editar chamado</h2>
              </div>
              <TicketForm
                initial={data}
                key={data.versao}
                submitLabel="Salvar alterações"
                onCancel={() => setMode('view')}
                onSubmit={async (values) => {
                  await api(`/chamados/${id}`, {
                    method: 'PATCH',
                    body: { ...values, versao: data.versao },
                  });
                  setMode('view');
                  setNotice('Chamado atualizado.');
                  ticket.reload();
                }}
              />
            </section>
          ) : (
            <section className="panel">
              <div className="panel-heading">
                <h2>Descrição do problema</h2>
                <span className="muted-small">Relato do cliente</span>
              </div>
              <div className="panel-padding">
                <p className="multiline description-text">{data.descricao}</p>
              </div>
            </section>
          )}
          {mode === 'resolve' && (
            <section className="panel resolution-form">
              <div className="panel-heading">
                <div>
                  <h2>Registrar a solução</h2>
                  <p>O chamado será encerrado e ficará disponível para consulta.</p>
                </div>
              </div>
              <form className="panel-padding" onSubmit={conclude}>
                <Field
                  name="resolucao"
                  label="Como o problema foi resolvido?"
                  hint="Descreva a solução em pelo menos 10 caracteres."
                >
                  <textarea
                    ref={resolutionRef}
                    id="resolucao"
                    name="resolucao"
                    rows={5}
                    minLength={10}
                    maxLength={5000}
                    placeholder="Explique o que foi feito para resolver o problema..."
                    required
                    disabled={busy}
                    aria-describedby="resolucao-hint"
                  />
                </Field>
                <div className="form-actions">
                  <button
                    type="button"
                    className="button button-secondary"
                    disabled={busy}
                    onClick={() => setMode('view')}
                  >
                    Cancelar
                  </button>
                  <button className="button button-primary" disabled={busy}>
                    <CheckCheck size={17} />
                    {busy ? 'Concluindo...' : 'Confirmar conclusão'}
                  </button>
                </div>
              </form>
            </section>
          )}
          {data.resolucao && (
            <section className="solution-card">
              <div>
                <span className="solution-icon">
                  <CheckCheck size={22} />
                </span>
                <div>
                  <h2>Solução do atendimento</h2>
                  <p>Concluído em {formatDate(data.concluido_em)}</p>
                </div>
              </div>
              <p className="multiline">{data.resolucao}</p>
            </section>
          )}
          <section className="panel">
            <div className="panel-heading">
              <div className="inline-heading">
                <MessageSquare size={20} />
                <h2>Conversa do atendimento</h2>
              </div>
              <span className="count-pill">{comments.result?.meta.total ?? '—'}</span>
            </div>
            {comments.loading ? (
              <Loading label="Carregando conversa..." />
            ) : comments.error ? (
              <div className="panel-padding">
                <ErrorMessage error={comments.error} onRetry={comments.reload} />
              </div>
            ) : comments.result?.data.length ? (
              <>
                <div className="comments-list">
                  {comments.result.data.map((item) => (
                    <article className="comment" key={item.id}>
                      <span
                        className={`avatar ${item.usuario_perfil === 'tecnico' ? 'avatar-technician' : ''}`}
                      >
                        {initials(item.usuario_nome)}
                      </span>
                      <div className="comment-content">
                        <div className="comment-meta">
                          <strong>{item.usuario_nome}</strong>
                          {item.usuario_perfil === 'tecnico' && (
                            <span className="technician-label">Suporte</span>
                          )}
                          <time dateTime={item.criado_em}>{formatDate(item.criado_em)}</time>
                        </div>
                        <p className="multiline">{item.mensagem}</p>
                      </div>
                    </article>
                  ))}
                </div>
                <Pagination meta={comments.result.meta} onChange={setCommentPage} />
              </>
            ) : (
              <div className="conversation-empty">
                <MessageSquare size={25} />
                <p>A conversa começa aqui.</p>
                <span>As mensagens deste atendimento aparecerão neste espaço.</span>
              </div>
            )}
            {canComment ? (
              <form className="comment-form" onSubmit={comment}>
                <label htmlFor="mensagem">Adicionar comentário</label>
                <textarea
                  id="mensagem"
                  name="mensagem"
                  rows={3}
                  placeholder="Escreva uma mensagem sobre o atendimento..."
                  required
                  minLength={1}
                  maxLength={2000}
                  disabled={busy}
                />
                <div>
                  <span>Compartilhe informações que ajudem na solução.</span>
                  <button className="button button-primary button-small" disabled={busy}>
                    <Send size={15} />
                    Enviar comentário
                  </button>
                </div>
              </form>
            ) : (
              <div className="closed-message">
                <LockKeyhole size={16} />
                {data.status === 'CONCLUIDO'
                  ? 'Atendimento concluído. O histórico permanece disponível.'
                  : 'Assuma este chamado para participar da conversa.'}
              </div>
            )}
          </section>
        </div>
        <aside className="detail-sidebar">
          <section className="panel">
            <div className="panel-heading">
              <h2>Sobre o chamado</h2>
            </div>
            <dl className="detail-facts">
              <div>
                <dt>Prioridade</dt>
                <dd>
                  <PriorityBadge priority={data.prioridade} />
                </dd>
              </div>
              <div>
                <dt>Categoria</dt>
                <dd>{categoryLabels[data.categoria]}</dd>
              </div>
              <div>
                <dt>
                  <UserRound size={14} />
                  Solicitante
                </dt>
                <dd>{data.cliente_nome}</dd>
              </div>
              <div>
                <dt>
                  <Headphones size={14} />
                  Responsável
                </dt>
                <dd>{data.tecnico_nome || 'Aguardando atribuição'}</dd>
              </div>
            </dl>
          </section>
          <section className="panel">
            <div className="panel-heading">
              <h2>Etapas do atendimento</h2>
            </div>
            <ol className="timeline">
              <li className="done">
                <span>
                  <Check size={14} />
                </span>
                <div>
                  <strong>Chamado aberto</strong>
                  <small>{formatDate(data.criado_em)}</small>
                </div>
              </li>
              <li className={data.iniciado_em ? 'done' : ''}>
                <span>{data.iniciado_em ? <Check size={14} /> : <Clock3 size={14} />}</span>
                <div>
                  <strong>Em atendimento</strong>
                  <small>
                    {data.iniciado_em ? formatDate(data.iniciado_em) : 'Aguardando um técnico'}
                  </small>
                </div>
              </li>
              <li className={data.concluido_em ? 'done' : ''}>
                <span>{data.concluido_em ? <Check size={14} /> : <CheckCheck size={14} />}</span>
                <div>
                  <strong>Concluído</strong>
                  <small>
                    {data.concluido_em
                      ? formatDate(data.concluido_em)
                      : 'Solução ainda não registrada'}
                  </small>
                </div>
              </li>
            </ol>
          </section>
        </aside>
      </div>
    </>
  );
}
