export const statusLabels = {
  ABERTO: 'Aberto',
  EM_ATENDIMENTO: 'Em atendimento',
  CONCLUIDO: 'Concluído',
};
export const categoryLabels = {
  acesso: 'Acesso e contas',
  hardware: 'Equipamentos',
  software: 'Software',
  rede: 'Rede e conexão',
  outros: 'Outros',
};
export const priorityLabels = { baixa: 'Baixa', media: 'Média', alta: 'Alta' };
export const protocol = (id) => `HD-${String(id).padStart(6, '0')}`;
export function formatDate(value, short = false) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: short ? 'short' : 'medium',
    ...(short ? {} : { timeStyle: 'short' }),
  }).format(date);
}
export const initials = (name) =>
  name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?';
export function passwordError(value) {
  if ([...value].length < 8) return 'Use pelo menos 8 caracteres.';
  if (new TextEncoder().encode(value).length > 72)
    return 'A senha deve ter no máximo 72 bytes em UTF-8.';
  return '';
}
