# Homologação local e de produção — Front-end HelpDesk

Data: 03/09/2026.

A interface foi implementada, compilada e testada contra a API e o MySQL locais reais. Também foi publicada na Vercel e homologada contra a API no Render e o MySQL da Aiven.

| Verificação                 | Resultado                                              |
| --------------------------- | ------------------------------------------------------ |
| ESLint                      | Aprovado, sem erros.                                   |
| Testes de utilitários       | 3 aprovados.                                           |
| Build Vite                  | Aprovado, com validação de URL e política CSP.         |
| Testes Playwright no build  | 2 cenários aprovados.                                  |
| Interface desktop e móvel   | Conferida em capturas; menu fechado oculto e sem foco. |
| Auditoria npm na instalação | Nenhuma vulnerabilidade reportada.                     |
| Front-end público            | HTTP 200 no domínio estável da Vercel.                 |
| Integração pública           | CORS 204 e API/Swagger/readiness HTTP 200.             |
| Navegador em produção        | Login, chamado e status `Concluído` aprovados.         |

O fluxo completo valida cadastro/login, abertura, comentários, atribuição ao técnico, solução, recarregamento e consulta no celular. Sessões de cliente e técnico são separadas. Uma entrada semelhante a script é exibida como texto, sem execução. Há teste de confirmação de senha divergente e de tratamento de sessão expirada.

A API possui outros 22 testes aprovados: 13 de regras/contrato/configuração e 9 de integração MySQL, totalizando **27 verificações automatizadas** entre os dois repositórios.

As capturas locais ficam em `test-results/chamado-tecnico.png` e `test-results/chamado-mobile.png`, geradas pela suíte e ignoradas pelo Git.

## Acesso

- Front-end público: `https://helpdesk-befinkler.vercel.app`.
- API pública: `https://helpdesk-api-befinkler.onrender.com`.
- Swagger público: `https://helpdesk-api-befinkler.onrender.com/api-docs`.
- Credenciais de demonstração: `.local/ACESSO_PRODUCAO.txt` no back-end, ignorado pelo Git.

Abra `http://localhost:5173`, crie um cliente e faça login. A conta de técnico e sua senha gerada estão em `.local/ACESSO_LOCAL.txt` no back-end. A API precisa estar ativa em `http://localhost:3000` com `FRONTEND_URL=http://localhost:5173`.

Use `npm run dev` neste repositório. Para reiniciar o ambiente, siga também os comandos do README do back-end.

## Versionamento e publicação

O código usa a feature `feature/implementacao-web`, integrada em `develop` e promovida para `main`, com commits em português. As branches foram publicadas no GitHub e a Vercel acompanha `main`.

A hospedagem foi executada e homologada em 03/09/2026. O plano gratuito do Render pode atrasar a primeira requisição após um período sem uso; a tela apresenta o erro de conexão se o limite de 25 segundos for excedido, e uma nova tentativa funciona após a API iniciar.
