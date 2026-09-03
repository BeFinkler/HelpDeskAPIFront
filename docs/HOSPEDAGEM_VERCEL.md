# Passo a passo — HelpDesk na Vercel

Este projeto tem três serviços independentes: front-end React na Vercel, API Express no Render e MySQL na Aiven. A Vercel hospeda este repositório do front-end; a API e o banco são publicados antes para fornecer os dados reais.

## 1. Conferir a versão local e as branches

No back-end:

```powershell
npm ci
npm run lint
npm test
npm run test:integration
npm run setup:e2e
```

No front-end:

```powershell
npm ci
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

O MySQL local precisa estar ativo para os testes da API. A suíte do navegador usa o banco de testes, a API na porta 3001 e o front-end na 5174.

O fluxo de desenvolvimento é feature → develop. Para uma publicação estável, envie os commits locais ao GitHub e faça um pull request de develop para main em cada repositório. Confirme os checks antes da integração. Se optar por publicar develop inicialmente, selecione explicitamente essa branch no provedor; a main inicial sem a implementação não produz a aplicação.

No back-end, publique as branches locais:

```powershell
git push -u origin develop
git push -u origin feature/implementacao-api
```

No front-end:

```powershell
git push -u origin develop
git push -u origin feature/implementacao-web
```

Depois da integração dos pull requests, use main como branch de produção nos dois serviços. Confira que os `package-lock.json` estão publicados e que `.env`, `.local` e senhas não aparecem no GitHub.

## 2. Preparar o banco MySQL na Aiven

Crie um serviço MySQL e um banco dedicado ao HelpDesk. Obtenha host, porta, usuário, senha e o certificado CA. Configure TLS verificado; os dados do EventHub permanecem em seu próprio banco/esquema.

No back-end, crie um arquivo privado `.env.production`, ignorado pelo Git, com as variáveis de produção listadas em seu README. Converta o arquivo CA para Base64 e preencha `DB_SSL_CA_BASE64`:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes('C:\caminho\ca.pem'))
```

Gere um novo segredo JWT para produção, salve-o no arquivo privado e no Render, e aplique:

```powershell
node --env-file=.env.production scripts/migrate.js
node --env-file=.env.production scripts/setup-technician.js
```

O comando de técnico usa as variáveis `SETUP_TECHNICIAN_*`. Remova a senha de provisionamento depois de criar a conta. O guia detalhado é `docs/DEPLOY_API.md` no back-end. [Documentação de conexão Aiven](https://aiven.io/docs/products/mysql/howto/connect-from-mysql-workbench).

## 3. Publicar o back-end no Render

Crie um **Web Service** conectado ao repositório `BeFinkler/HelpDeskAPIBack`:

| Campo          | Valor                             |
| -------------- | --------------------------------- |
| Branch         | main, contendo a versão integrada |
| Runtime        | Node 24                           |
| Root Directory | Raiz do repositório               |
| Build Command  | `npm ci`                          |
| Start Command  | `npm start`                       |
| Health Check   | `/health/ready`                   |

Configure `NODE_ENV=production`, conexão MySQL, `DB_SSL=true`, CA, segredo JWT, emissor/audiência, custo bcrypt e as duas origens:

```dotenv
API_PUBLIC_URL=https://SUA-API.onrender.com
FRONTEND_URL=https://SEU-FRONTEND.vercel.app
```

São exemplos de formato: substitua pelas URLs reais, sem barra final. Se o domínio do front-end ainda não estiver confirmado, finalize-o depois da criação do projeto Vercel. Não habilite uma origem curinga.

O servidor usa a porta fornecida pelo Render. Depois do deploy, visite `/health/ready` e `/api-docs` para verificar banco e autenticação. [Guia oficial do Render](https://render.com/docs/deploy-node-express-app).

## 4. Importar o front-end na Vercel

1. Entre na Vercel com a conta vinculada ao GitHub.
2. Escolha **Add New → Project** e importe `BeFinkler/HelpDeskAPIFront`.
3. Confirme a raiz do projeto e selecione o preset **Vite**.
4. Configure a branch de produção como **main**, contendo a implementação.
5. Confirme as configurações abaixo, também registradas no `vercel.json`.

| Campo            | Valor               |
| ---------------- | ------------------- |
| Framework Preset | Vite                |
| Root Directory   | Raiz do repositório |
| Install Command  | `npm ci`            |
| Build Command    | `npm run build`     |
| Output Directory | `dist`              |
| Node.js          | 24                  |

A Vercel suporta projetos Vite e documenta o uso de rewrites para rotas diretas de SPAs. [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite).

## 5. Definir a variável do front-end

Antes de publicar, em Environment Variables, crie:

```dotenv
VITE_API_URL=https://SUA-API.onrender.com/api/v1
```

Selecione o ambiente **Production**. A URL deve usar HTTPS e terminar em `/api/v1`. Não use localhost, `/api-docs` ou somente a origem sem o prefixo.

Somente essa URL pública pertence à configuração do navegador. Não coloque `DB_PASSWORD`, `JWT_SECRET`, CA ou senha de técnico no front-end. Valores `VITE_` são incorporados ao JavaScript público durante o build. Mudanças exigem um novo deploy. [Variáveis do Vite](https://vite.dev/guide/env-and-mode).

## 6. Publicar e ajustar a origem exata

Clique em **Deploy**, aguarde o build e copie o domínio estável do projeto, por exemplo `https://SEU-FRONTEND.vercel.app`.

No Render, atualize `FRONTEND_URL` com exatamente esse domínio, sem caminho nem barra final, e aplique o novo deploy/reinício. Confirme também `API_PUBLIC_URL`.

Use o domínio estável para a avaliação. URLs temporárias de preview possuem outra origem e não são liberadas automaticamente pela API. Para uma homologação separada, use uma API/ambiente específico; não substitua a política por `*` ou por todos os domínios `vercel.app`.

## 7. Rotas, segurança e build

O `vercel.json` já encaminha rotas da aplicação para `index.html`, preservando os assets. Isso permite abrir `/login`, `/painel` e `/chamados/123` diretamente ou usar F5. O front-end mantém suas rotas privadas protegidas, e a API aplica as permissões reais.

O build valida a URL e adiciona uma política CSP ao HTML com `connect-src` restrito à origem da API. Cabeçalhos adicionais impedem enquadramento em iframe e sniffing de conteúdo. Fontes opcionais usam os domínios oficiais do Google; há fallback local.

Se trocar a URL da API, atualize `VITE_API_URL` e gere um novo deploy. Se trocar o domínio do front-end, ajuste `FRONTEND_URL` no Render.

## 8. Homologar em janela anônima

1. Abra a URL estável do front-end em uma janela anônima.
2. Cadastre um cliente e faça login.
3. Abra um chamado e envie um comentário.
4. Em outro navegador/perfil, entre com a conta de técnico criada no banco de produção.
5. Assuma o chamado, comente e conclua informando a solução.
6. Atualize a página do cliente e confira a solução e o histórico.
7. Abra diretamente a URL de detalhes e pressione F5.
8. Saia e confirme que as páginas privadas exigem login.
9. Confira o Swagger público com JWT e a persistência após reiniciar a API.

Use dados próprios de demonstração, sem informação sensível.

O Render gratuito suspende o serviço após 15 minutos sem tráfego. O primeiro acesso pode levar aproximadamente um minuto; a interface permite tentar novamente. Para disponibilidade contínua sem suspensão, use um plano compatível. [Limitações oficiais](https://render.com/docs/free).

## 9. Resolver problemas comuns

| Sintoma                          | Conferência                                                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------------- |
| Build falha por variável ausente | Configure `VITE_API_URL` em Production e gere outro deploy.                                         |
| API retorna origem não permitida | Compare domínio, protocolo e porta com `FRONTEND_URL`; use o domínio estável.                       |
| Página fica sem dados            | Confira `/health/ready`, logs do Render e o endereço completo da API.                               |
| Rota direta dá 404               | Confira se `vercel.json` está na raiz da branch publicada e se o preset é Vite.                     |
| Banco não conecta                | Confira porta Aiven, credenciais, nome do banco e CA; mantenha TLS validado.                        |
| Login técnico não funciona       | Crie o técnico no banco de produção, não apenas no banco local.                                     |
| JWT inválido após deploy         | Confira se `JWT_SECRET`, emissor e audiência foram mantidos; entre novamente após trocar o segredo. |
| Dados desaparecem                | Confirme que a API usa o banco Aiven; este projeto não grava chamados no disco do Render.           |

## 10. Preencher a entrega

```text
2. APLICAÇÃO 2: HELPDESK (ARQUITETURA REST)
* Link da API Backend (Render): https://helpdesk-api-befinkler.onrender.com
* Link da Documentação Swagger: https://helpdesk-api-befinkler.onrender.com/api-docs
* Link do Frontend Consumidor (Vercel): https://helpdesk-befinkler.vercel.app
* Link do Repositório GitHub (API Backend): https://github.com/BeFinkler/HelpDeskAPIBack
* Link do Repositório GitHub (Frontend): https://github.com/BeFinkler/HelpDeskAPIFront
```

Inclua esse trecho no relatório já existente do EventHub, com nome e turma corretos. A publicação em nuvem só está concluída depois de testar as URLs reais.
