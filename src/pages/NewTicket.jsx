import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, MessageSquare, CheckCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { PageHeading } from '../components/ui';
import TicketForm from '../components/TicketForm';

export default function NewTicket() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (user.perfil !== 'cliente') return <Navigate to="/chamados" replace />;
  const submit = async (values) => {
    const { data } = await api('/chamados', { method: 'POST', body: values });
    navigate(`/chamados/${data.id}`, { replace: true, state: { created: true } });
  };
  return (
    <>
      <Link to="/chamados" className="back-link">
        <ArrowLeft size={16} />
        Voltar para os chamados
      </Link>
      <PageHeading
        eyebrow="VAMOS ENCONTRAR UMA SOLUÇÃO"
        title="Como podemos ajudar?"
        description="Conte o que está acontecendo e nossa equipe cuidará do próximo passo."
      />
      <div className="form-page-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Detalhes do chamado</h2>
              <p>Preencha as informações para iniciar o atendimento.</p>
            </div>
            <span className="panel-symbol">
              <FileText size={21} />
            </span>
          </div>
          <TicketForm onSubmit={submit} onCancel={() => navigate('/chamados')} />
        </section>
        <aside className="guidance-card">
          <span className="eyebrow">O QUE ACONTECE DEPOIS?</span>
          <h2>
            Você acompanha
            <br />
            cada etapa.
          </h2>
          <div className="guidance-step">
            <span>
              <FileText size={18} />
            </span>
            <div>
              <strong>1. Chamado aberto</strong>
              <p>Seu pedido entra na nossa fila de suporte.</p>
            </div>
          </div>
          <div className="guidance-step">
            <span>
              <MessageSquare size={18} />
            </span>
            <div>
              <strong>2. Conversa com a equipe</strong>
              <p>Um técnico assume o atendimento e conversa com você.</p>
            </div>
          </div>
          <div className="guidance-step">
            <span>
              <CheckCheck size={18} />
            </span>
            <div>
              <strong>3. Solução registrada</strong>
              <p>O atendimento é concluído e o histórico fica disponível.</p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
