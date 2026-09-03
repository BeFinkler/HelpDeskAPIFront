import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { protocol, formatDate, categoryLabels } from '../utils/format';
import { StatusBadge, PriorityBadge } from './ui';

export default function TicketTable({ tickets, technician = false }) {
  return (
    <div className="table-scroll">
      <table className="ticket-table">
        <caption className="sr-only">Lista de chamados de suporte</caption>
        <thead>
          <tr>
            <th scope="col">Chamado</th>
            <th scope="col">Status</th>
            <th scope="col">Prioridade</th>
            {technician && <th scope="col">Solicitante</th>}
            <th scope="col">Criado em</th>
            <th scope="col">
              <span className="sr-only">Ação</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>
                <span className="ticket-protocol">{protocol(ticket.id)}</span>
                <Link className="ticket-title" to={`/chamados/${ticket.id}`}>
                  {ticket.titulo}
                </Link>
                <span className="ticket-category">{categoryLabels[ticket.categoria]}</span>
              </td>
              <td>
                <StatusBadge status={ticket.status} />
              </td>
              <td>
                <PriorityBadge priority={ticket.prioridade} />
              </td>
              {technician && <td className="table-person">{ticket.cliente_nome}</td>}
              <td className="table-date">{formatDate(ticket.criado_em, true)}</td>
              <td>
                <Link
                  className="table-open"
                  aria-label={`Abrir ${protocol(ticket.id)}`}
                  to={`/chamados/${ticket.id}`}
                >
                  <ArrowUpRight size={18} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
