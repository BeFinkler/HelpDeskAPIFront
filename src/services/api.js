const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'helpdesk.token';

export const session = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: token => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(message, status = 0, code = 'NETWORK_ERROR', fields = []) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

/** Cliente HTTP único. POST/PATCH nunca são repetidos automaticamente. */
export async function api(path, { method = 'GET', body, signal, anonymous = false } = {}) {
  if (!API_URL) throw new ApiError('A conexão com o serviço ainda não foi configurada.');
  const token = anonymous ? null : session.get();
  const timeout = AbortSignal.timeout(25000);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method, signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      credentials: 'omit', cache: 'no-store',
    });
    if (!anonymous && token !== session.get()) throw new DOMException('Sessão alterada.', 'AbortError');
    const payload = response.headers.get('content-type')?.includes('application/json') ? await response.json() : null;
    if (!response.ok) {
      if (response.status === 401 && !anonymous && token === session.get()) window.dispatchEvent(new Event('helpdesk:unauthorized'));
      throw new ApiError(payload?.error?.message || 'O serviço está temporariamente indisponível. Tente novamente.', response.status, payload?.error?.code, payload?.error?.fields);
    }
    if (!payload) throw new ApiError('O serviço retornou uma resposta inesperada. Tente novamente.');
    return payload;
  } catch (error) {
    if (error instanceof ApiError || signal?.aborted || error.name === 'AbortError') throw error;
    if (timeout.aborted) throw new ApiError('O serviço está demorando para responder. Aguarde um momento e tente novamente.');
    throw new ApiError('Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.');
  }
}
