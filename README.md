# Desafio Técnico QA — Automação Web + API com Playwright

Automação de 2 cenários Web (TodoMVC) e 2 cenários de API (GitHub REST) com Playwright Test + TypeScript.

| ID  | Tipo | Cenário                                                       | Arquivo                                 |
| --- | ---- | ------------------------------------------------------------- | --------------------------------------- |
| W1  | Web  | Adicionar tarefas e validar o contador "items left"           | `tests/web/add-todos.spec.ts`           |
| W2  | Web  | Concluir tarefa e validar os filtros Active / Completed / All | `tests/web/complete-and-filter.spec.ts` |
| A1  | API  | `GET /users/octocat` → 200 e campos esperados                 | `tests/api/users.spec.ts`               |
| A2  | API  | `GET /users/{inexistente}` → 404                              | `tests/api/users.spec.ts`               |

## Pré-requisitos

- Node.js 18 ou superior
- Git

## Instalação

No PowerShell:
```bash
git clone https://github.com/brunomedeiros-db/Desafio-Tecnico.git
cd Desafio-Tecnico
npm ci
```
Se o PowerShell bloquear o `npm`, rode
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` e confirme com `S`.
```bash
npx playwright install chromium
```

## Executando

```bash
npm test              # todos os testes (web + api)
npm run test:web      # apenas W1 e W2
npm run test:api      # apenas A1 e A2
npm run test:headed   # testes web com o navegador visível
npm run test:debug    # execução passo a passo com o Playwright Inspector
npm run report        # abre o relatório HTML da última execução
```

Qualidade de código:

```bash
npm run typecheck     # checagem de tipos (tsc)
npm run lint          # ESLint (inclui regras específicas de Playwright)
npm run format:check  # verifica formatação (Prettier)
npm run format        # aplica a formatação
```

Saída esperada de `npm test`:

```
  ✓ W1 - Adicionar tarefas
  ✓ W2 - Concluir e filtrar
  ✓ A1 - usuário válido retorna 200 e os campos esperados
  ✓ A2 - usuário inexistente retorna 404
  4 passed
```

### Variáveis de ambiente (todas opcionais)

| Variável       | Padrão                                 | Uso                                                                                                                                       |
| -------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `GITHUB_TOKEN` | —                                      | Autentica na API do GitHub apenas para elevar o rate limit (60 req/h por IP sem autenticação). **Não é necessário** para rodar o desafio. |
| `WEB_BASE_URL` | `https://demo.playwright.dev/todomvc/` | Aponta os testes web para outro ambiente.                                                                                                 |
| `API_BASE_URL` | `https://api.github.com`               | Aponta os testes de API para outro ambiente (ex.: um mock).                                                                               |

## Estrutura

```
.
├── playwright.config.ts          # projetos "web" e "api", reporters, trace/screenshot em falha
├── src/
│   ├── pages/TodoPage.ts         # Page Object do TodoMVC
│   ├── api/GithubUsersClient.ts  # client da API + detecção de rate limit
│   ├── fixtures/index.ts         # fixtures customizadas (todoPage, githubUsers)
│   └── data/                     # massa de teste (tarefas, usernames)
├── tests/
│   ├── web/                      # W1, W2
│   └── api/                      # A1, A2
├── eslint.config.mjs             # ESLint 9 (flat config) + regras de Playwright
└── .github/workflows/            # pipeline de CI (GitHub Actions)
```

## Decisões de projeto

- **Dois projetos no Playwright (`web` e `api`).** Os testes de API não abrem navegador, e cada grupo pode rodar isoladamente. `baseURL` e headers ficam na configuração, não espalhados pelos testes.
- **Page Object + fixtures.** Os testes descrevem comportamento (`addTodos`, `complete`, `filterBy`); detalhes de seletor ficam no `TodoPage`. A fixture `todoPage` já abre a aplicação, então cada teste começa direto no cenário.
- **Seletores estáveis e acessíveis.** Prioridade para `placeholder`, `role` e `data-testid`, que o próprio app expõe, em vez de classes CSS, que mudam com mais facilidade.
- **Isolamento.** Cada teste roda em um contexto de navegador novo (o TodoMVC persiste no `localStorage`), então não há dependência entre testes e eles rodam em paralelo.
- **`test.step`** em cada etapa, para que o relatório HTML e o trace fiquem legíveis por fase do cenário.
- **W2 valida os três filtros.** O enunciado pede Active e Completed; validar também All confirma que filtrar não apaga dados.
- **A1 valida contrato, não valores voláteis.** Verifica presença e tipo dos campos (`login`, `id`, `public_repos`, …) e compara apenas valores estáveis (`login`, `type`, `html_url`). Contagens como `public_repos` mudam a qualquer momento, então só é exigido que sejam números ≥ 0 — caso contrário o teste quebraria sozinho com o tempo.
- **A2 usa um username gerado dinamicamente**, com formato válido para o GitHub (letras, números e hífen, até 39 caracteres). Assim o 404 vem de "usuário não encontrado", e não de uma entrada malformada, e o teste não depende de um nome fixo que alguém poderia registrar no futuro.
- **Rate limit tratado explicitamente.** Se a API responder 403/429 com `x-ratelimit-remaining: 0`, o teste falha com mensagem clara, incluindo o horário de reset. A opção foi **falhar** em vez de **pular**, para não registrar como sucesso algo que não chegou a ser verificado.
- **Evidências apenas em falha** (`trace`, `screenshot`, `video`) e 1 retry somente em CI, para não mascarar instabilidade durante o desenvolvimento.
- **Versões fixadas** no `package.json` com `package-lock.json`, para execução reprodutível via `npm ci`.
- **Lint, format e typecheck** fazem parte do pipeline, junto com os testes.

## Solução de problemas

| Sintoma                                                                                  | Causa e solução                                                                                                                    |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `npm : ... npm.ps1 não pode ser carregado porque a execução de scripts foi desabilitada` | Política do PowerShell no Windows. Rode `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, ou use o Prompt de Comando (`cmd`). |
| Teste de API falha com mensagem de rate limit                                            | Limite de 60 requisições/hora por IP sem autenticação. Aguarde alguns minutos ou defina `GITHUB_TOKEN`.                            |
| `Executable doesn't exist at ...chromium`                                                | Faltou `npx playwright install chromium`.                                                                                          |
| Teste web falha por timeout ao abrir a página                                            | Rede ou proxy bloqueando `demo.playwright.dev`.                                                                                    |
