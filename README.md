# HelpDesk — Front-end

Cliente Web independente do [HelpDeskAPIBack](https://github.com/BeFinkler/HelpDeskAPIBack), com React, Vite, React Router e JavaScript. Consome JSON por `fetch` e não acessa o banco diretamente.

Implementação validada localmente com a API real e o build de produção no navegador. Consulte [as evidências e os limites da homologação](docs/STATUS_IMPLEMENTACAO.md).

## Funcionalidades

- Cadastro, login e navegação por perfil.
- Painel com contagens reais e chamados recentes.
- Listagem, filtros, busca por título/protocolo e paginação.
- Abertura, edição enquanto aberto, detalhes, comentários e histórico.
- Técnico assume atendimento e conclui com solução registrada.
- Restauração da sessão da aba, logout e tratamento de expiração/falhas.
- Interface responsiva, labels, foco visível e estados de carregamento.

## Instalação local

Requisito: Node.js 24. Prepare e inicie a API conforme o README do back-end.

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Se `.env` já existir, confira-o antes de copiar. Ele deve conter:

```dotenv
VITE_API_URL=http://localhost:3000/api/v1
```

Acesse [http://localhost:5173](http://localhost:5173). Crie um cliente na tela de cadastro. A conta de técnico é criada no back-end; se foi usado `setup:local`, as credenciais estão no arquivo privado `.local/ACESSO_LOCAL.txt` daquele repositório.

O front-end usa `import.meta.env`; a URL é incorporada no build. Nunca coloque senhas ou segredos em variáveis `VITE_`.

## Variáveis e comandos

| Variável               | Finalidade                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL`         | Origem da API seguida de `/api/v1`. Local: `http://localhost:3000/api/v1`; produção: API HTTPS no Render. |
| `HELPDESK_BACKEND_DIR` | Opcional para testes: caminho do back-end quando não estiver na pasta irmã `HelpDeskAPIBack`.             |

| Comando                                   | Finalidade                                                   |
| ----------------------------------------- | ------------------------------------------------------------ |
| `npm install`                             | Instalar dependências no desenvolvimento.                    |
| `npm ci`                                  | Instalar conforme o lockfile, depois de gerado.              |
| `npm run dev`                             | Vite na porta 5173.                                          |
| `npm run build`                           | Produzir `dist`, validar URL e aplicar política de conteúdo. |
| `npm run preview`                         | Servir o build na porta 4173.                                |
| `npm run lint`                            | Verificar código com ESLint.                                 |
| `npm run format` / `npm run format:check` | Formatar/verificar código e documentação.                    |
| `npm test`                                | Testar utilitários.                                          |
| `npm run test:e2e`                        | Playwright com API e banco de testes reais.                  |

Para testar `preview` conectado à API, altere temporariamente `FRONTEND_URL` no back-end para `http://localhost:4173` e reinicie-o. Restaure 5173 ao voltar ao desenvolvimento; o CORS usa uma origem exata.

## Testes de navegador

1. No back-end, execute `npm run setup:e2e` com o banco de testes configurado.
2. Aqui, execute `npx playwright install chromium`.
3. Execute `npm run test:e2e`.

A suíte sobe a API na porta 3001, gera o build e serve o front-end na porta 5174. Verifica cadastro/login, abertura, recarregamento, comentário como texto, atendimento por técnico, conclusão e consulta pelo cliente em celular. O fluxo positivo usa a API real; a expiração é simulada no navegador e também coberta com JWT expirado nos testes de integração da API.

Resultados e capturas ficam em `test-results` e `playwright-report`, ignorados pelo Git. A suíte exige os arquivos privados `.local/e2e-api.env` e `.local/e2e-user.json` gerados pelo back-end.

## Organização e sessão

```text
src/
  components/  # navegação, campos, tabela e formulários
  contexts/    # autenticação
  hooks/       # busca com cancelamento
  pages/       # telas
  routes/      # proteção de navegação
  services/    # fetch e erros HTTP
  styles/      # apresentação responsiva
  utils/       # rótulos, datas e validação de senha
```

O token fica em `sessionStorage`, sobrevive ao recarregamento da aba e é removido no logout. Esse armazenamento é acessível ao JavaScript: os relatos usam escape do React, sem HTML arbitrário, e o build aplica CSP para a origem exata da API. Logout local não revoga tokens já emitidos no servidor.

As fontes do Google são opcionais para a apresentação; a interface usa fontes do sistema se não carregarem.

## Deploy na Vercel

Siga o [passo a passo de hospedagem](docs/HOSPEDAGEM_VERCEL.md). Ele cobre branches, banco Aiven, API no Render, variáveis da Vercel, origem exata do CORS, rotas da SPA e homologação pública.

`vercel.json` configura build, saída, fallback de rotas e cabeçalhos. `scripts/security-headers.js` valida a API e adiciona CSP ao HTML de produção. Mudanças de `VITE_API_URL` exigem novo build.

Documentos: [plano do front-end](docs/PLANO_FRONTEND.md) e [estado da implementação](docs/STATUS_IMPLEMENTACAO.md).
