# Plano de implementação — Front-end HelpDesk

Data: 03/09/2026. Plano de referência aprovado. A interface foi implementada e validada localmente; consulte STATUS_IMPLEMENTACAO.md para as evidências.

## Objetivo e integração

Construir o cliente Web da Aplicação 2 da recuperação trimestral. Este repositório terá instalação e deploy independentes da API, consumirá JSON via fetch e será publicado na Vercel. O EventHub já foi realizado e está fora deste trabalho.

O plano integrado de arquitetura, dados, endpoints, segurança, etapas e homologação está em docs/PLANO_IMPLEMENTACAO.md no repositório [HelpDeskAPIBack](https://github.com/BeFinkler/HelpDeskAPIBack).

## Tecnologia e organização

- React com JavaScript, Vite, React Router e CSS responsivo próprio.
- pages para páginas; components para elementos reutilizáveis; services para fetch; contexts para autenticação; hooks para carregamento e operações; styles para apresentação.
- VITE_API_URL será a única configuração inicial de integração: URL pública com o prefixo /api/v1.
- Não incluir credenciais de MySQL ou segredo JWT no front-end. Variáveis VITE_ são públicas no build. [Documentação Vite](https://vite.dev/guide/env-and-mode).
- Fetch centralizado com cabeçalho Authorization: Bearer, tratamento de expiração, erros, cancelamento e respostas não JSON do provedor.

## Páginas e comportamento

| Página            | Comportamento                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| /login            | Autenticação com e-mail/senha, carregamento, mostrar senha e mensagens de erro.                                  |
| /cadastro         | Nome, e-mail, senha e confirmação; criação exclusiva de cliente; após sucesso, login.                            |
| /painel           | Contagens reais de chamados por status, respeitando o perfil.                                                    |
| /chamados         | Busca, filtros, paginação, status, prioridade e acesso aos detalhes.                                             |
| /chamados/novo    | Abertura por cliente com título, descrição, categoria e prioridade.                                              |
| /chamados/:id     | Dados, participantes, datas, solução e comentários; ações de edição, atendimento e conclusão conforme permissão. |
| Rota desconhecida | Página de não encontrado com retorno à navegação.                                                                |

As rotas privadas aguardam validação da sessão antes de exibir dados. A rota /chamados/novo tem precedência sobre /chamados/:id.

## Perfis e fluxo de atendimento

Cliente: cadastra-se, autentica, vê somente seus chamados, abre tickets, edita o relato enquanto Aberto, comenta enquanto não concluído e consulta a solução.

Técnico: usa conta criada de forma controlada no back-end, consulta a fila, assume chamado Aberto, comenta no atendimento sob sua responsabilidade e conclui informando a solução.

```text
Aberto → Em Atendimento → Concluído
```

Concluído é o encerramento. O JSON usa ABERTO, EM_ATENDIMENTO e CONCLUIDO, mapeados para esses rótulos. Não oferecer ações de exclusão ou reabertura nesta versão.

O botão Assumir chama PATCH /chamados/:id/status com EM_ATENDIMENTO e versao. Concluir chama a mesma rota com CONCLUIDO, versao e resolucao. A API determina o técnico e valida a transição. Conflito 409 exige recarregar os dados e informar que o chamado mudou.

Esconder ou desabilitar ações conforme o perfil melhora o uso; todas as permissões também serão verificadas pela API.

## Autenticação e estado

- Login recebe JWT, expiração e usuário; salvar token em sessionStorage para persistir ao recarregar a aba.
- Validar o usuário por GET /auth/me ao restaurar a sessão. Não inferir permissões apenas de dados editáveis do armazenamento do navegador.
- Ao receber 401, remover sessão e dados privados e encaminhar ao login com mensagem de expiração.
- Logout limpa o token e o estado local. Não apresentar essa ação como revogação no servidor: o JWT emitido permanece válido até expirar.
- sessionStorage é acessível ao JavaScript; renderizar texto com escape, configurar CSP e evitar HTML arbitrário. Não usar dangerouslySetInnerHTML para relatos e comentários.
- Ao trocar usuário ou sair, cancelar requisições pendentes e impedir que respostas da sessão anterior repovoem a interface.

## Padrões de interface

- Interface em português e datas em pt-BR, com datas UTC preservadas no contrato.
- Status identificados por cor e texto; prioridade e categoria consistentes em formulários, filtros e detalhes.
- Inputs com labels, foco visível, navegação por teclado e erros ligados aos campos.
- Layout adaptado a celular, incluindo listagem e formulário de detalhes.
- Carregamento, lista vazia, envio em andamento, erro e sucesso representados separadamente.
- Não confirmar sucesso antes da resposta da API. Não repetir POST/PATCH automaticamente depois de falha de rede.
- Cancelar ou ignorar buscas antigas quando filtros mudarem. Atualizar a lista, detalhes e indicadores após uma alteração bem-sucedida.
- API indisponível deve gerar mensagem e opção de tentar novamente; não deve virar lista vazia.

## Etapas de execução

| Etapa                  | Implementação                                                              | Aceite                                                                 |
| ---------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1. Base                | Criar Vite/React, scripts, lint, .env.example, rotas e cliente HTTP.       | Instalação independente e build de produção funcionando.               |
| 2. Integração inicial  | Configurar URL da API e publicação mínima na Vercel quando houver acesso.  | Conexão real com API no Render e CORS compatível.                      |
| 3. Acesso              | Login, cadastro, contexto, restauração da sessão e logout.                 | Usuários reais entram e saem; rotas privadas exigem autenticação.      |
| 4. Chamados do cliente | Painel, lista, abertura, edição permitida, detalhes e comentários.         | Cliente abre e acompanha ticket persistido na API.                     |
| 5. Atendimento técnico | Fila, filtro de meus atendimentos, assumir e concluir com solução.         | Técnico atende e conclui; cliente visualiza resultado.                 |
| 6. Qualidade           | Responsividade, acessibilidade e tratamento de falhas; testes Playwright.  | Fluxo completo, isolamento, expiração e estados negativos verificados. |
| 7. Entrega             | vercel.json, variáveis finais, README, .env.example e homologação pública. | Link público e rotas diretas funcionam em janela anônima.              |

## Testes necessários

Usar Playwright com API real e banco dedicado de testes para o fluxo cliente → abertura → técnico assume → comentários → conclusão → cliente consulta. Testar também recarga de página, autenticação expirada, conflitos de atualização, chamado não autorizado, campos inválidos, falha de rede e uso em tela pequena.

A homologação final deve ocorrer também na Vercel e no Render, em janela anônima, com dados próprios de demonstração. Testes locais não comprovam o deploy.

## Scripts e documentação previstos

- npm install: instalação local.
- npm run dev: servidor de desenvolvimento.
- npm run build: build de produção em dist.
- npm run preview: conferência local do build.
- npm run lint: verificação de código.
- npm run test:e2e: testes de navegador, com os requisitos da API e do banco documentados.
- npm ci: instalação reproduzível no CI a partir do lockfile.

O README deverá explicar requisitos, instalação, configuração de VITE_API_URL, execução, build, testes, publicação e fluxo por perfil, com links reais do front-end, API e Swagger ao final da homologação.

## Publicação

Na Vercel: conectar este repositório, usar preset Vite, build npm run build e saída dist. Definir VITE_API_URL com a API pública; recompilar quando essa variável mudar. Configurar fallback das rotas React e cabeçalhos de segurança, preservando assets e conexão HTTPS com a API. [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite).

No Render: FRONTEND_URL deve corresponder exatamente ao domínio estável da Vercel. Previews com domínios diferentes não são liberados automaticamente. Validar preflight com Authorization e consumo assíncrono real.

Se a API usar o plano gratuito do Render, tratar o primeiro carregamento e falhas temporárias: o provedor documenta suspensão após 15 minutos sem tráfego e retomada que pode demorar aproximadamente um minuto. [Limitações do Render](https://render.com/docs/free).

Considerar esta aplicação pronta somente quando as telas funcionarem com dados persistidos na API pública, as permissões forem confirmadas e a documentação permitir reproduzir a execução.
