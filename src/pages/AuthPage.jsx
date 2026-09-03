import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Eye, EyeOff, Headphones, MessageSquare, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { passwordError } from '../utils/format';
import { Logo } from '../components/Layout';
import { Field, ErrorMessage, Loading } from '../components/ui';

export default function AuthPage({ register = false }) {
  const { status, login, error: sessionError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState({});
  const [visible, setVisible] = useState(false);
  if (status === 'authenticated') return <Navigate to="/painel" replace />;
  if (status === 'loading') return <div className="screen-center"><Loading /></div>;
  const submit = async event => {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(form);
    const validation = {};
    if (passwordError(values.senha)) validation.senha = passwordError(values.senha);
    if (register && values.senha !== values.confirmacao) validation.confirmacao = 'As senhas precisam ser iguais.';
    setFields(validation); setError(null);
    if (Object.keys(validation).length) return;
    setBusy(true);
    try {
      if (register) {
        await api('/auth/cadastro', { method: 'POST', anonymous: true, body: { nome: values.nome.trim(), email: values.email.trim(), senha: values.senha } });
        navigate('/login', { state: { registered: true }, replace: true });
      } else {
        await login(values.email.trim(), values.senha);
        const from = location.state?.from;
        navigate(typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : '/painel', { replace: true });
      }
    } catch (failure) { setError(failure); setFields(Object.fromEntries((failure.fields || []).map(field => [field.field, field.message]))); }
    finally { setBusy(false); }
  };
  return <div className="auth-page">
    <section className="auth-story"><Link className="auth-brand" to="/login" aria-label="HelpDesk"><Logo light /></Link><div className="auth-story-content"><span className="auth-kicker"><span /> SUA CENTRAL DE SUPORTE</span><h1>Menos obstáculos.<br />Mais <span>soluções.</span></h1><p>Um espaço para conectar você à ajuda de que precisa. Simples, organizado e sempre a um chamado de distância.</p><div className="support-illustration" aria-hidden="true"><div className="illustration-orbit orbit-one" /><div className="illustration-orbit orbit-two" /><div className="illustration-center"><Headphones size={56} strokeWidth={1.5} /></div><div className="floating-card card-message"><MessageSquare size={22} /><span>Vamos resolver isso.</span></div><div className="floating-card card-check"><span><Check size={18} /></span>Problema resolvido</div><i className="spark spark-one" /><i className="spark spark-two" /></div></div><div className="auth-trust"><ShieldCheck size={17} /> Seu atendimento, do início à solução.</div></section>
    <section className="auth-form-section"><div className="auth-mobile-brand"><Logo /></div><div className="auth-form-wrap"><p className="eyebrow">{register ? 'SEU PRIMEIRO PASSO' : 'BOM TER VOCÊ AQUI'}</p><h2>{register ? 'Crie sua conta' : 'Entre no seu espaço'}</h2><p className="auth-description">{register ? 'Cadastre-se para abrir e acompanhar seus chamados.' : 'Acompanhe seus chamados e continue de onde parou.'}</p>
      {location.state?.registered && !register && <p className="success-box" role="status"><Check size={18} />Conta criada! Entre com seu e-mail e senha.</p>}
      <ErrorMessage error={error || (!register ? sessionError : null)} />
      <form onSubmit={submit} className="auth-form">
        {register && <Field label="Nome completo" name="nome" error={fields.nome}><input id="nome" name="nome" autoComplete="name" placeholder="Como podemos chamar você?" minLength={2} maxLength={100} required disabled={busy} aria-invalid={!!fields.nome} aria-describedby={fields.nome ? 'nome-error' : undefined} /></Field>}
        <Field label="E-mail" name="email" error={fields.email}><input id="email" name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" maxLength={254} required disabled={busy} aria-invalid={!!fields.email} aria-describedby={fields.email ? 'email-error' : undefined} /></Field>
        <Field label="Senha" name="senha" error={fields.senha} hint={register ? 'Pelo menos 8 caracteres.' : undefined}><div className="password-input"><input id="senha" name="senha" type={visible ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} placeholder={register ? 'Crie uma senha segura' : 'Digite sua senha'} required minLength={8} disabled={busy} aria-invalid={!!fields.senha} aria-describedby={fields.senha ? 'senha-error' : register ? 'senha-hint' : undefined} /><button type="button" className="password-toggle" aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setVisible(value => !value)}>{visible ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></Field>
        {register && <Field label="Confirme sua senha" name="confirmacao" error={fields.confirmacao}><input id="confirmacao" name="confirmacao" type={visible ? 'text' : 'password'} autoComplete="new-password" placeholder="Digite a senha novamente" required disabled={busy} aria-invalid={!!fields.confirmacao} aria-describedby={fields.confirmacao ? 'confirmacao-error' : undefined} /></Field>}
        <button className="button button-primary button-full" disabled={busy}>{busy ? 'Aguarde...' : register ? 'Criar minha conta' : 'Entrar'}{!busy && <ArrowRight size={18} />}</button>
      </form><p className="auth-switch">{register ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'} <Link to={register ? '/login' : '/cadastro'}>{register ? 'Entrar' : 'Criar conta'}</Link></p><div className="auth-form-footer"><ShieldCheck size={15} /> Um espaço seguro para o seu atendimento.</div>
    </div><p className="auth-copyright">HelpDesk · Central de suporte</p></section>
  </div>;
}
