# API do Projeto Solaris

Base: `http://localhost:8080` · Formato: JSON (UTF-8) · Datas: ISO-8601 (`2026-10-15`, `2026-10-15T14:30:00`)

## Autenticação e sessão

A API usa **sessão HTTP** (cookie `JSESSIONID`, `HttpOnly`, `SameSite=Strict`, expira após 30 min sem uso).

Toda requisição que **altera dados** (POST, PUT, PATCH, DELETE) precisa do token **CSRF**:

1. `GET /api/auth/csrf` → o servidor grava o cookie `XSRF-TOKEN`.
2. Envie o valor do cookie no cabeçalho `X-XSRF-TOKEN`.

Sem o token, a resposta é `403 Token CSRF inválido`. Após login ou logout, peça um token novo.

## Perfis e permissões

| Recurso | Visitante | USUARIO | ADMIN |
|---|:-:|:-:|:-:|
| Ver catálogo de espécies | ✅ | ✅ | ✅ |
| Cadastro e login | ✅ | ✅ | ✅ |
| CRUD e regas do **próprio** jardim | ❌ 401 | ✅ | ✅ |
| Jardim de **outro** usuário | ❌ | ❌ 404 | ❌ 404 |
| Gerenciar espécies | ❌ 401 | ❌ 403 | ✅ |
| Ativar/desativar usuários | ❌ 401 | ❌ 403 | ✅ |

ADMIN herda tudo de USUARIO (hierarquia de papéis). O acesso ao recurso de outro usuário responde **404** (e não 403) para não revelar que o id existe.

## Paginação

Rotas de listagem aceitam `pagina` (padrão `0`, mínimo `0`) e `tamanho` (padrão `20`, de `1` a `50`) e respondem:

```json
{ "itens": [ ... ], "pagina": 0, "tamanho": 20, "totalItens": 42, "totalPaginas": 3 }
```

## Formato de erro (RFC 9457 - Problem Details)

```json
{
  "type": "about:blank",
  "title": "Dados inválidos",
  "status": 400,
  "detail": "Um ou mais campos estão inválidos.",
  "instance": "/api/plantas",
  "campos": { "dataPlantio": "A data de plantio não pode ser no futuro." }
}
```

| Status | Título | Quando |
|---|---|---|
| 400 | Dados inválidos | Validação falhou (`campos` traz a mensagem de cada campo) |
| 401 | Login necessário / Não autenticado | Sem sessão, ou e-mail/senha inválidos |
| 403 | Acesso negado / Token CSRF inválido | Perfil sem permissão, ou CSRF ausente |
| 404 | Recurso não encontrado | Id inexistente ou de outro usuário |
| 409 | Conflito | E-mail já cadastrado, nome científico repetido etc. |
| 429 | Muitas tentativas | 5 logins falhos do mesmo IP em 15 min (cabeçalho `Retry-After` em segundos) |
| 500 | Erro interno | Falha inesperada (detalhes só no log do servidor) |

---

## Autenticação - `/api/auth`

### `GET /api/auth/csrf` - público
Gera o token CSRF. **200**
```json
{ "cabecalho": "X-XSRF-TOKEN", "token": "3f1c..." }
```

### `POST /api/auth/cadastro` - público
Cria conta com perfil USUARIO. **201**
```json
{ "nome": "Maria Silva", "email": "maria@exemplo.com", "senha": "minhasenha123" }
```
- `nome`: 2-80 caracteres · `email`: válido, até 254 · `senha`: 8-72 caracteres (guardada com BCrypt)
- Resposta: `{ "id": 7, "nome": "Maria Silva", "email": "maria@exemplo.com", "perfil": "USUARIO" }`
- Erros: 400, 409 (e-mail já cadastrado)

### `POST /api/auth/login` - público
Abre a sessão. **200** (mesmo corpo do cadastro)
```json
{ "email": "maria@exemplo.com", "senha": "minhasenha123" }
```
- Erros: 400, 401 (credenciais inválidas ou conta desativada), 429

### `POST /api/auth/logout` - autenticado
Encerra a sessão e apaga o cookie. **204**

### `GET /api/auth/eu` - autenticado
Dados do usuário logado. **200** · Erro: 401

---

## Catálogo - `/api/especies` (público)

### `GET /api/especies?q=&pagina=&tamanho=`
Lista espécies **ativas**. `q` (opcional, até 100 caracteres) busca pelo nome popular ou científico. **200**
```json
{
  "id": 1, "nomePopular": "Jiboia", "nomeCientifico": "Epipremnum aureum",
  "categoria": "interior", "categoriaRotulo": "Planta de interior",
  "luz": "Meia-sombra", "regimeRega": "MODERADO", "intervaloRegaDias": 3,
  "dificuldade": "FACIL", "fotoUrl": "assets/images/jiboia.jpg"
}
```
`dificuldade`: `MUITO_FACIL`, `FACIL`, `MEDIA`, `DIFICIL`

### `GET /api/especies/{id}`
**200** · Erro: 404 (inexistente ou inativa)

---

## Jardim - `/api/plantas` (autenticado, só as próprias plantas)

### `GET /api/plantas?pagina=&tamanho=`
**200** · Página de plantas:
```json
{
  "id": 12, "apelido": "Jiboia da sala", "dataPlantio": "2026-09-01",
  "especie": { "id": 1, "nomePopular": "Jiboia", "...": "..." },
  "estado": {
    "diasDePlantada": 44, "fase": "CRESCIMENTO", "faseRotulo": "Crescimento",
    "progressoFase": 35, "humor": "FELIZ", "intervaloRegaDias": 3,
    "diasAteProximaRega": 2, "ultimaRega": "2026-10-14T09:12:00"
  }
}
```
`estado` é calculado no servidor a cada requisição. `humor`: `FELIZ`, `ATENCAO`, `SEDENTA`.

### `GET /api/plantas/{id}`
**200** · Erro: 404

### `POST /api/plantas`
**201**
```json
{ "especieId": 1, "apelido": "Jiboia da sala", "dataPlantio": "2026-09-01" }
```
- `especieId`: obrigatório, positivo · `apelido`: opcional, até 60 · `dataPlantio`: obrigatória, não pode ser futura
- Erros: 400, 404 (espécie não encontrada)

### `PUT /api/plantas/{id}`
**200** · Altera apelido e data (a espécie não muda).
```json
{ "apelido": "Jiboia do quarto", "dataPlantio": "2026-09-01" }
```

### `DELETE /api/plantas/{id}`
**204** · Remove a planta e o histórico de regas. Erro: 404

### `POST /api/plantas/{id}/regas`
Registra uma rega agora. **201** (devolve a planta com o `estado` atualizado)

### `GET /api/plantas/{id}/regas?pagina=&tamanho=`
Histórico, da mais recente para a mais antiga. **200**
```json
{ "itens": [ { "id": 40, "regadaEm": "2026-10-14T09:12:00" } ], "pagina": 0, "...": "..." }
```

---

## Administração - `/api/admin/**` (somente ADMIN)

### Espécies - `/api/admin/especies`

| Método e rota | Resposta | Descrição |
|---|---|---|
| `GET /api/admin/especies?pagina=&tamanho=` | 200 | Lista **todas** (ativas e inativas) |
| `GET /api/admin/especies/opcoes` | 200 | Listas para os `<select>` do formulário |
| `GET /api/admin/especies/{id}` | 200 / 404 | Detalhe |
| `POST /api/admin/especies` | 201 / 400 / 404 / 409 | Cria |
| `PUT /api/admin/especies/{id}` | 200 / 400 / 404 / 409 | Atualiza |
| `PATCH /api/admin/especies/{id}/ativo` | 200 / 404 | Ativa ou desativa (exclusão lógica) |

Corpo de criação e atualização:
```json
{
  "nomePopular": "Jiboia", "nomeCientifico": "Epipremnum aureum",
  "categoriaId": 2, "nivelLuzId": 2, "regimeRegaId": 2,
  "dificuldade": "FACIL", "fotoUrl": "assets/images/jiboia.jpg"
}
```
- `nivelLuzId` e `fotoUrl` são opcionais.
- `fotoUrl` aceita apenas `https://...` ou `assets/images/arquivo.ext`.

Opções:
```json
{ "categorias": [ { "id": 1, "rotulo": "Horta e ervas" } ], "niveisLuz": [ ... ], "regimesRega": [ ... ] }
```

Resposta (admin) inclui os ids, `origem` e `ativo`:
```json
{ "id": 1, "nomePopular": "Jiboia", "...": "...", "origem": "LOCAL", "ativo": true }
```

### Usuários - `/api/admin/usuarios`

| Método e rota | Resposta | Descrição |
|---|---|---|
| `GET /api/admin/usuarios?pagina=&tamanho=` | 200 | Lista usuários |
| `PATCH /api/admin/usuarios/{id}/ativo` | 200 / 404 / 409 | Ativa ou desativa |

```json
{ "ativo": false }
```
- Uma conta desativada perde a sessão na próxima requisição e não consegue mais logar.
- Contas ADMIN não podem ser desativadas por esta rota (409).

Resposta:
```json
{
  "id": 7, "nome": "Maria Silva", "email": "maria@exemplo.com", "perfil": "USUARIO",
  "ativo": true, "ultimoLoginEm": "2026-10-15T10:02:11", "criadoEm": "2026-10-01T18:40:00"
}
```

---

Exemplos executáveis de todas as rotas: [`backend/api.http`](../backend/api.http) (extensão REST Client do VS Code).