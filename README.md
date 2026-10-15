# Projeto Solaris

Sistema web de gerenciamento e simulação de cultivo de plantas. O usuário monta
o seu jardim virtual, registra as regas e acompanha uma **simulação idealizada
em linha do tempo** (da brotação até a fase adulta), com um indicador de "humor"
da planta inspirado em um tamagotchi digital.

A versão atual (Trabalho II) transforma o protótipo estático do Trabalho I em uma
aplicação **cliente–servidor**: front-end em HTML/CSS/JavaScript puro, back-end
em **Java com Spring Boot** e banco **MySQL**, com autenticação, dois perfis de
acesso e dados persistidos no servidor.

**Repositório:** <https://github.com/GuilhermeBertola1/Projeto-Solaris>

> Trabalho Individual II — Sistemas para Comunicação (SCOM), UNESP Sorocaba.
> Autor: Guilherme Fontes Bertola (RA 241270596).
> Prof. Leopoldo André Dutra Lusquino Filho.

---

## Funcionalidades

**Visitante (sem login)**

* Consulta o catálogo de 100 espécies, com busca por nome popular ou científico
  e paginação.
* Cria a própria conta e faz login.

**Usuário (`USUARIO`)**

* **Meu Jardim** — CRUD das próprias plantas (adicionar, editar apelido e data de
  plantio, remover), com destaque automático para as que precisam de rega.
* **Perfil e simulação** — fase atual, barra de progresso da fase, humor,
  previsão da próxima rega, ficha de cuidados e histórico paginado de regas.
* Cada usuário vê e altera **somente as próprias plantas**.

**Administrador (`ADMIN`)**

* Tudo o que o usuário faz, mais o painel de **Administração**:
  * cadastro, edição e ativação/desativação de espécies do catálogo;
  * listagem de usuários e ativação/desativação de contas.

| Recurso                             | Visitante | USUARIO | ADMIN |
|-------------------------------------|:---------:|:-------:|:-----:|
| Ver catálogo                        | sim       | sim     | sim   |
| CRUD e regas do próprio jardim      | não       | sim     | sim   |
| Jardim de outro usuário             | não       | não     | não   |
| Gerenciar espécies                  | não       | não     | sim   |
| Ativar/desativar usuários           | não       | não     | sim   |

---

## Tecnologias

| Camada         | Tecnologia                                                        |
|----------------|-------------------------------------------------------------------|
| Front-end      | HTML5, CSS3 e JavaScript puro (sem framework), padrão MVVM        |
| Back-end       | Java 21, Spring Boot 4.1 (Web MVC, Data JPA, Security, Validation)|
| Banco de dados | MySQL 8.4, migrações com Flyway                                   |
| Testes         | JUnit 5, AssertJ, Spring MockMvc, Testcontainers                  |
| Execução       | Docker e Docker Compose                                           |

---

## Como executar

### Pré-requisitos

* **Docker Desktop** (ou Docker Engine + Compose) — obrigatório nas duas formas.
* Para rodar sem container (opção B): **JDK 21** e **Maven 3.9+**.

### 1. Clonar e configurar o `.env`

```bash
git clone https://github.com/GuilhermeBertola1/Projeto-Solaris.git
cd Projeto-Solaris
cp .env.example .env        # no cmd do Windows: copy .env.example .env
```

Abra o `.env` e preencha os valores. Nenhuma senha fica no código: tudo vem
dessas variáveis.

| Variável           | Para que serve                                                       |
|--------------------|----------------------------------------------------------------------|
| `DB_ROOT_SENHA`    | senha do root do MySQL (usada só pelo container do banco)            |
| `DB_USUARIO`       | usuário que a aplicação usa no banco                                 |
| `DB_SENHA`         | senha desse usuário                                                  |
| `DB_URL`           | endereço do banco quando a aplicação roda fora do container          |
| `ADMIN_EMAIL`      | e-mail do administrador criado na primeira subida                    |
| `ADMIN_SENHA`      | senha desse administrador (**mínimo de 12 caracteres**)              |
| `PERENUAL_API_KEY` | chave da API Perenual (opcional; reservada para importação futura)   |

> O `.env` está no `.gitignore` e no `.dockerignore`: ele nunca vai para o
> repositório nem para dentro da imagem Docker.

### Opção A — tudo em containers (recomendada)

Na raiz do projeto:

```bash
docker compose up -d --build
```

O Compose sobe o MySQL, espera ele ficar saudável (healthcheck) e só então sobe
a aplicação. A primeira execução demora alguns minutos por causa do download das
dependências do Maven dentro da imagem.

Acompanhe a inicialização até aparecer `Started SolarisApplication`:

```bash
docker compose logs -f APP
```

Depois, acesse **<http://localhost:8080>**.

Comandos úteis:

| Comando                        | O que faz                                              |
|--------------------------------|--------------------------------------------------------|
| `docker compose ps`            | mostra os containers e o estado de saúde               |
| `docker compose stop`          | para os containers, mantendo os dados                  |
| `docker compose up -d --build` | reconstrói a imagem depois de alterar o código         |
| `docker compose down -v`       | **apaga** containers e volumes (banco volta do zero)   |

### Opção B — aplicação pelo Maven (desenvolvimento)

Sobe só o banco em container e roda a aplicação na máquina:

```bash
docker compose up -d MYSQL
cd backend
mvn spring-boot:run
```

A aplicação lê o mesmo `.env` da raiz e fica em **<http://localhost:8080>**.

> As opções A e B usam a porta 8080. Para usar a B, pare antes o container da
> aplicação com `docker compose stop APP`.

### Primeiro acesso

* **Administrador:** na primeira subida, a aplicação cria a conta definida em
  `ADMIN_EMAIL` / `ADMIN_SENHA`. Entre por `login.html` e o menu passa a exibir
  o link **Administração**.
* **Usuário comum:** crie uma conta em `cadastro.html`.

O banco já vem com o catálogo de 100 espécies, as fases e os demais dados de
apoio, inseridos pela migração `V2__seed.sql`.

---

## Testes automatizados

São **31 testes**, executados com:

```bash
cd backend
mvn test
```

| Classe                      | Tipo       | O que verifica                                                |
|-----------------------------|------------|---------------------------------------------------------------|
| `SimulacaoTest`             | unitário   | fases, progresso, humor e próxima rega                         |
| `LimitadorDeLoginTest`      | unitário   | limite de tentativas de login e liberação após 15 min          |
| `CatalogoIntegracaoTest`    | integração | catálogo público, busca sem acento, SQL Injection na busca, paginação inválida, 404 |
| `SegurancaIntegracaoTest`   | integração | 401/403, CSRF, mensagem genérica no login, cadastro que tenta escolher o perfil, listagem sem hash, logout, rate limit e conta desativada |
| `JardimIntegracaoTest`      | integração | ciclo completo do CRUD e das regas, isolamento entre usuários, validação e HTML no apelido tratado como texto (XSS) |

Os testes de integração sobem um **MySQL 8.4 real e descartável** com
Testcontainers, aplicam as mesmas migrações do Flyway e não tocam no banco de
desenvolvimento. Por isso o **Docker precisa estar rodando** durante o
`mvn test`. Os relatórios ficam em `backend/target/surefire-reports/`.

---

## Documentação da API

* **[`docs/API.md`](docs/API.md)** — todas as rotas, permissões, corpos de
  requisição, respostas, paginação e códigos de erro.
* **[`backend/api.http`](backend/api.http)** — requisições prontas para
  executar com a extensão REST Client do VS Code.

Resumo das rotas:

| Prefixo               | Acesso        | Conteúdo                                         |
|-----------------------|---------------|--------------------------------------------------|
| `/api/auth`           | público/login | CSRF, cadastro, login, logout e usuário atual    |
| `/api/especies`       | público       | catálogo (somente leitura)                       |
| `/api/plantas`        | autenticado   | CRUD do jardim e regas                           |
| `/api/admin/especies` | ADMIN         | CRUD e ativação de espécies                      |
| `/api/admin/usuarios` | ADMIN         | listagem e ativação de usuários                  |

Todos os erros seguem o formato **Problem Details (RFC 9457)**, com `status`,
`title`, `detail` e, nos erros de validação, o mapa `campos` com a mensagem de
cada campo inválido.

---

## Banco de dados

O esquema é criado e versionado pelo **Flyway** a cada subida da aplicação:

| Arquivo                                            | Conteúdo                              |
|----------------------------------------------------|---------------------------------------|
| `backend/src/main/resources/db/migration/V1__schema.sql` | tabelas, chaves e constraints   |
| `backend/src/main/resources/db/migration/V2__seed.sql`   | dados iniciais e catálogo       |
| `database/solaris.sql`                             | script consolidado (V1 + V2) para criar o banco manualmente |

Tabelas: `perfil`, `usuario`, `categoria`, `fase`, `orientacao_fase`,
`nivel_luz`, `regime_rega`, `especie`, `planta` e `rega`.

As regras de integridade ficam também no banco, e não só no Java: chaves
estrangeiras, `UNIQUE` (e-mail do usuário, códigos das tabelas de apoio, id da
Perenual) e `CHECK` (por exemplo, a origem de uma espécie). O Hibernate roda com `ddl-auto=validate`: ele confere se
as entidades batem com o esquema, mas nunca altera o banco.

---

## Arquitetura

```
Navegador (HTML + CSS + JS)
        │  fetch JSON, cookie de sessão, cabeçalho X-XSRF-TOKEN
        ▼
Spring Boot :8080 ── serve também os arquivos de frontend/
        │  JPA / Hibernate
        ▼
MySQL 8.4 :3306
```

### Back-end — arquitetura em camadas

```
backend/src/main/java/solaris/
├── controller/   recebe o HTTP, valida a entrada (@Valid) e devolve DTOs
├── service/      regras de negócio e transações (inclui a posse das plantas)
├── repository/   acesso ao banco com Spring Data JPA
├── domain/       entidades JPA e enums
├── dto/          records de entrada e saída da API (a entidade nunca sai crua)
├── simulacao/    regra pura da simulação (fases, humor, rega), sem Spring
├── seguranca/    configuração do Spring Security, admin inicial, rate limit
└── erro/         exceções da aplicação e tratador global (Problem Details)
```

Cada camada só conhece a de baixo: o controller não acessa o repositório e a
entidade não é exposta diretamente na resposta.

### Front-end — MVVM sem framework

```
frontend/
├── index.html, perfil.html        jardim e simulação (exigem login)
├── catalogo.html                  catálogo público
├── login.html, cadastro.html      autenticação
├── admin.html                     painel do administrador
├── css/style.css                  folha única com design tokens
└── js/
    ├── models/       apiCliente (fetch + CSRF + erros), authModel, plantasModel,
    │                 jardimModel, simulacaoModel, adminModel, imagemModel
    ├── viewmodels/   estado reativo com Proxy (catálogo, jardim, admin)
    ├── views/        cardPlanta, formularioView, menuSessao
    └── *App.js       ponto de entrada de cada página
```

* **Model** — conversa com a API e traduz as respostas para o formato da tela.
* **ViewModel** — o estado é um `Proxy`: qualquer atribuição dispara o re-render.
* **View** — manipula o DOM a partir do estado.

---

## Segurança

| Ameaça / requisito         | Medida adotada                                                                 |
|----------------------------|--------------------------------------------------------------------------------|
| Senhas                     | hash **BCrypt** (custo 12); a senha nunca é gravada nem registrada em log      |
| Sessão                     | cookie `JSESSIONID` `HttpOnly` e `SameSite=Strict`, expira em 30 min; o id da sessão é trocado no login (anti session fixation) |
| CSRF                       | token em cookie `XSRF-TOKEN` exigido no cabeçalho `X-XSRF-TOKEN` em toda requisição que altera dados |
| Controle de acesso         | rotas protegidas por perfil (`ADMIN` herda `USUARIO`); recurso de outro usuário responde 404 |
| Força bruta                | 5 logins falhos por IP em 15 min → `429 Too Many Requests` com `Retry-After`   |
| Conta desativada           | perde a sessão na requisição seguinte e não consegue mais logar                |
| SQL Injection              | consultas parametrizadas via JPA/JPQL; nenhuma SQL montada com concatenação    |
| XSS                        | escape de todo texto inserido no DOM + **Content-Security-Policy** (`script-src 'self'`) |
| Validação                  | Bean Validation em todos os DTOs de entrada, repetida no banco por constraints |
| Vazamento de informação    | erros padronizados sem stack trace; detalhes técnicos só no log do servidor   |
| Credenciais                | nenhuma no código: tudo em `.env`, fora do Git e da imagem Docker              |
| Container                  | aplicação roda com usuário sem privilégios; portas publicadas só em `127.0.0.1`|

---

## Logs

A aplicação registra, com data e hora, inicialização, cadastros, logins
(sucesso e falha, com IP), ações administrativas e erros inesperados.

* **Docker:** `docker compose logs -f APP`, e o arquivo `logs/solaris.log` no
  volume `logs-app`.
* **Maven:** `backend/logs/solaris.log`.

O arquivo é rotacionado a cada 10 MB, guardando 14 arquivos.

---

## Estrutura do repositório

```
Projeto-Solaris/
├── backend/            aplicação Spring Boot (pom.xml, src/, api.http)
├── frontend/           páginas, CSS, JavaScript e imagens
├── database/           script SQL consolidado
├── docs/               documentação da API
├── compose.yaml        MySQL + aplicação
├── Dockerfile          build multi-stage da aplicação
├── .env.example        modelo das variáveis de ambiente
├── .gitattributes      normalização de fim de linha
└── .github/workflows/  publicação da versão estática (T1) no GitHub Pages
```

---

## Versionamento

* Commits no padrão **Conventional Commits** (`feat`, `fix`, `refactor`,
  `test`, `docs`, `build`, `chore`).
* Uma branch por etapa (`feat/banco`, `feat/backend-base`, `feat/catalogo`,
  `feat/autenticacao`, `feat/jardim`, `feat/admin`, `feat/front-integracao`,
  `test/automatizados`, `chore/fechamento`), integradas à `main` com
  `merge --no-ff` para preservar o histórico de cada etapa.
* Tags de entrega: `v1.0-t1` (Trabalho I) e `v2.0-t2` (Trabalho II).

```bash
git log --oneline --graph --all
```

---

## Interface (herdado do Trabalho I)

O cuidado com a interface do Trabalho I foi mantido nas páginas novas:

* **Acessibilidade (WCAG 2.2 AA):** estrutura semântica, um `h1` por página,
  link "Pular para o conteúdo", foco visível, navegação por teclado, regiões
  `aria-live`, `aria-current`, barra de progresso com `aria-valuetext`,
  formulários com `label` e mensagens de erro associadas aos campos, contraste
  mínimo de 4,89:1 e `prefers-reduced-motion`.
* **Responsividade:** três faixas (até 600px, 601–900px e acima de 900px), sem
  rolagem horizontal.
* **Design tokens:** identidade visual centralizada em variáveis CSS no `:root`.
* **Desempenho:** sem framework nem build step, fonte do sistema, imagens com
  dimensões explícitas e montagem da página sem deslocamento de layout (CLS 0).

Na entrega do Trabalho I, o Lighthouse (modo mobile) marcou 100 em
Acessibilidade, Boas práticas e SEO nas três páginas, e 94 a 99 em Desempenho.

---

## Limitações conhecidas

* O GitHub Pages hospeda apenas a versão estática do Trabalho I (tag `v1.0-t1`).
  A versão atual precisa do back-end e do banco, então deve ser executada
  localmente, como descrito acima.
* O limite de tentativas de login fica em memória: reinicia junto com a
  aplicação e vale para uma única instância.
* A importação de espécies da API Perenual ainda não foi implementada. O banco
  já está preparado para ela (coluna `perenual_id` e origem `PERENUAL`).
* A simulação de crescimento é idealizada: considera apenas o tempo desde o
  plantio e as regas, sem clima, substrato ou condições reais de cultivo.

---

## Uso de inteligência artificial

Ferramentas de IA foram usadas como apoio no planejamento das etapas, na
explicação de conceitos (Spring Security, CSRF, Testcontainers, Docker), na
revisão do código escrito pelo autor e na investigação de erros. O código foi
escrito, revisado, testado e validado pelo autor. A declaração detalhada está no
relatório do trabalho.
