import { useState } from 'react';
import { Send } from 'lucide-react';
import { categoryLabels, priorityLabels } from '../utils/format';
import { ErrorMessage, Field } from './ui';

export default function TicketForm({ initial = {}, onSubmit, onCancel, submitLabel = 'Abrir chamado' }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const submit = async event => {
    event.preventDefault();
    if (busy) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true); setError(null); setErrors({});
    try { await onSubmit(values); }
    catch (failure) { setError(failure); setErrors(Object.fromEntries((failure.fields || []).map(field => [field.field, field.message]))); }
    finally { setBusy(false); }
  };
  return <form className="ticket-form" onSubmit={submit}><ErrorMessage error={error} />
    <Field name="titulo" label="Título do chamado" hint="Um resumo claro ajuda a entender o que você precisa." error={errors.titulo}><input id="titulo" name="titulo" placeholder="Ex.: Não consigo acessar meu e-mail" defaultValue={initial.titulo || ''} required minLength={3} maxLength={160} disabled={busy} aria-invalid={!!errors.titulo} aria-describedby={errors.titulo ? 'titulo-error' : 'titulo-hint'} /></Field>
    <div className="form-grid"><Field name="categoria" label="Categoria" error={errors.categoria}><select id="categoria" name="categoria" defaultValue={initial.categoria || ''} required disabled={busy} aria-invalid={!!errors.categoria}><option value="" disabled>Selecione a categoria</option>{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
      <Field name="prioridade" label="Prioridade" error={errors.prioridade}><select id="prioridade" name="prioridade" defaultValue={initial.prioridade || 'media'} disabled={busy} aria-invalid={!!errors.prioridade}>{Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field></div>
    <Field name="descricao" label="O que aconteceu?" hint="Descreva o problema, quando começou e o que você já tentou. Não envie senhas." error={errors.descricao}><textarea id="descricao" name="descricao" rows={7} placeholder="Conte um pouco mais para conseguirmos ajudar..." defaultValue={initial.descricao || ''} minLength={10} maxLength={5000} required disabled={busy} aria-invalid={!!errors.descricao} aria-describedby={errors.descricao ? 'descricao-error' : 'descricao-hint'} /></Field>
    <div className="form-actions">{onCancel && <button className="button button-secondary" type="button" disabled={busy} onClick={onCancel}>Cancelar</button>}<button className="button button-primary" disabled={busy}>{busy ? 'Salvando...' : submitLabel}<Send size={17} /></button></div>
  </form>;
}
