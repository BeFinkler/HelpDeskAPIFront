# Homologação local — Front-end HelpDesk

Data: 03/09/2026.

A interface foi implementada, compilada e testada contra a API e o MySQL locais reais.

| Verificação                 | Resultado                                              |
| --------------------------- | ------------------------------------------------------ |
| ESLint                      | Aprovado, sem erros.                                   |
| Testes de utilitários       | 3 aprovados.                                           |
| Build Vite                  | Aprovado, com validação de URL e política CSP.         |
| Testes Playwright no build  | 2 cenários aprovados.                                  |
| Interface desktop e móvel   | Conferida em capturas; menu fechado oculto e sem foco. |
| Auditoria npm na instalação | Nenhuma vulnerabilidade reportada.                     |

O fluxo completo valida cadastro/login, abertura, comentários, atribuição ao técnico, solução, recarregamento e consulta no celular. Sessões de cliente e técnico são separadas. Uma entrada semelhante a script é exibida como texto, sem execução. Há teste de confirmação de senha divergente e de tratamento de sessão expirada.

A API possui outros 22 testes aprovados: 13 de regras/contrato/configuração e 9 de integração MySQL, totalizando **27 verificações automatizadas** entre os dois repositórios.

As capturas locais ficam em `test-results/chamado-tecnico.png` e `test-results/chamado-mobile.png`, geradas pela suíte e ignoradas pelo Git.

## Acesso

Abra `http://localhost:5173`, crie um cliente e faça login. A conta de técnico e sua senha gerada estão em `.local/ACESSO_LOCAL.txt` no back-end. A API precisa estar ativa em `http://localhost:3000` com `FRONTEND_URL=http://localhost:5173`.

Use `npm run dev` neste repositório. Para reiniciar o ambiente, siga também os comandos do README do back-end.

## Versionamento e próxima etapa

O código usa a feature `feature/implementacao-web`, integrada em `develop`, com commits em português. A publicação dos commits no GitHub e a integração em main antecedem a hospedagem de produção.

A hospedagem ainda não foi executada. Siga [HOSPEDAGEM_VERCEL.md](HOSPEDAGEM_VERCEL.md) e teste as URLs públicas em janela anônima antes da entrega ao professor.
