import { readFile, writeFile } from 'node:fs/promises';
import { loadEnv } from 'vite';

const env = { ...loadEnv('production', process.cwd(), 'VITE_'), ...process.env };
let apiUrl;
try { apiUrl = new URL(env.VITE_API_URL); } catch { throw new Error('Configure VITE_API_URL antes de gerar o build.'); }
if (!['http:', 'https:'].includes(apiUrl.protocol) || apiUrl.username || apiUrl.password || apiUrl.search || apiUrl.hash || apiUrl.pathname.replace(/\/$/, '') !== '/api/v1') {
  throw new Error('VITE_API_URL deve apontar para a origem da API seguida de /api/v1.');
}
if (process.env.VERCEL && (apiUrl.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(apiUrl.hostname))) {
  throw new Error('Use a API pública HTTPS no deploy da Vercel.');
}
// A origem é determinada no build; nenhum domínio de API adicional é liberado.
const policy = `default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' ${apiUrl.origin}; object-src 'none'; base-uri 'self'; form-action 'self'`;
const file = new URL('../dist/index.html', import.meta.url);
const html = await readFile(file, 'utf8');
await writeFile(file, html.replace('<head>', `<head>\n    <meta http-equiv="Content-Security-Policy" content="${policy}">`));
console.log('Build validado e política de conteúdo configurada para a origem da API.');
