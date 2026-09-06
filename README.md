# Projeto Solaris

Sistema web de gerenciamento e simulação de cultivo de plantas, feito para ajudar
o usuário a acompanhar o desenvolvimento das suas plantas de forma visual e
intuitiva.

O projeto tem foco estrito em engenharia de interface: semântica web,
responsividade, acessibilidade e desempenho.

---

## Objetivo do projeto

Muitas pessoas desistem de cultivar plantas por ansiedade ou por falta de
conhecimento sobre o tempo natural de crescimento de cada espécie. O Projeto
Solaris responde a isso com uma interface em que o usuário adiciona plantas ao
seu jardim virtual e visualiza uma **simulação idealizada em linha do tempo**
(da germinação até a fase adulta), com um indicador de "humor" da planta
inspirado em um tamagotchi digital.

O objetivo técnico é entregar uma interface limpa, acessível e responsiva, com
boa experiência de uso em qualquer dispositivo.

---

## Funcionalidades

* **Catálogo de busca** — procura espécies de plantas (API Perenual, com
  fallback para um banco local de 100 espécies) e adiciona ao jardim virtual.
* **Meu Jardim** — painel principal com as plantas do usuário e destaque
  automático para as que precisam de rega.
* **Perfil e simulação** — linha do tempo com o estágio atual de desenvolvimento
  (Brotação → Crescimento Vegetativo → Fase Adulta) e o humor da planta,
  calculado a partir da última rega. O botão "Reguei hoje" atualiza esse estado.

---

## Como executar

O projeto é um protótipo front-end estático: **não precisa de servidor, Node.js,
build step ou banco de dados.**

1. Clone o repositório:

   ```bash
   git clone https://github.com/SEU_USUARIO/Projeto-Solaris.git
   ```

2. Abra o arquivo `index.html` diretamente em um navegador moderno
   (Chrome, Firefox ou Edge). É só dar duplo clique.

> O projeto usa **scripts clássicos com namespace global** (`window.Solaris`) em
> vez de ES Modules justamente para funcionar assim. Navegadores bloqueiam
> `import`/`export` no protocolo `file://` por política de CORS; com o namespace,
> a página abre direto do disco, sem servidor local.
>
> Quando a página é aberta por `file://`, as requisições à API externa também
> seriam bloqueadas — por isso o catálogo detecta o protocolo e usa direto o
> banco local, sem gerar erros no console.

---

## Arquitetura

Construído sem frameworks, para priorizar o domínio dos fundamentos da web.
A organização segue o padrão **MVVM**:

```
js/
├── utils.js                    escape de HTML e debounce
├── models/                     dados e regras de negócio (sem DOM)
│   ├── dados_locais.js         banco local de 100 espécies
│   ├── plantasModel.js         API Perenual + fallback local
│   ├── jardimModel.js          persistência em localStorage
│   └── simulacaoModel.js       regras de fase de crescimento e humor
├── viewmodels/                 estado reativo via Proxy
│   ├── catalogoViewModel.js
│   └── jardimViewModel.js
├── views/
│   └── cardPlanta.js           template do card, compartilhado
├── dashboardApp.js             view de index.html
├── catalogoApp.js              view de catalogo.html
└── perfilApp.js                view de perfil.html
```

* **Model** — acesso a dados e regras puras, sem tocar no DOM, o que permite
  reaproveitar e testar as regras de forma isolada.
* **ViewModel** — o estado é um `Proxy`: qualquer atribuição dispara o re-render
  da View. É reatividade sem framework, em ~15 linhas.
* **View** — manipula o DOM a partir do estado do ViewModel.

Os `<script>` são carregados na ordem de dependência no fim do `<body>` de cada
página.

---

## Design tokens

Toda a identidade visual sai de variáveis CSS declaradas em `:root`.

**Paleta principal — 6 cores.** Todas as demais são variações claras destas:

| Token               | Valor     | Uso                                  |
|---------------------|-----------|--------------------------------------|
| `--cor-primaria`    | `#2e7d32` | botões, links, títulos               |
| `--cor-secundaria`  | `#1b5e20` | estados hover e foco                 |
| `--cor-destaque`    | `#8a4b00` | painel de dicas                      |
| `--cor-fundo`       | `#f8faf8` | fundo da página e das superfícies    |
| `--cor-texto`       | `#1c2d1c` | texto principal                      |
| `--cor-texto-suave` | `#4a5d4a` | texto secundário e bordas de campo   |

Outros tokens: `--raio-sm` / `--raio-md` (raios de borda), `--medida-texto`
(largura máxima de linha, 65ch), `--sombra-card` / `--sombra-hover`,
`--espaco-secao` e `--fonte-principal` (uma única família tipográfica, a do
sistema).

---

## Acessibilidade (WCAG 2.2 nível AA)

* Estrutura semântica completa: `header`, `nav`, `main`, `section`, `article`,
  `aside`, `footer`, `figure`, `figcaption`.
* Hierarquia de títulos lógica, com exatamente um `h1` por página.
* Link "Pular para o conteúdo principal" como primeiro elemento focável.
* Navegação completa por teclado, com foco visível (`:focus-visible`, 3px).
* Após "Reguei hoje" o foco volta para o botão, que é recriado no re-render.
* Regiões `aria-live` anunciam a adição ao jardim e a rega a leitores de tela.
* `aria-current="page"` marca a página atual na navegação.
* Todas as imagens têm `alt`; sprites decorativos usam `alt=""` para não
  duplicar a informação já presente no texto ao lado.
* Rótulos de link e de botão únicos, com o nome da planta em texto só para
  leitor de tela.
* Contraste verificado em todos os pares de cor: mínimo de 4.89:1 para texto
  e 6.77:1 para bordas de componente (o mínimo exigido é 4.5:1 e 3:1).
* `prefers-reduced-motion` respeitado.

---

## Responsividade

Três faixas, com layout distinto em cada uma:

| Faixa                | Largura           | Layout                        |
|----------------------|-------------------|-------------------------------|
| Celular              | até 600px         | 1 coluna, navegação empilhada |
| Tablet/intermediário | 601px a 900px     | 2 colunas                     |
| Desktop              | acima de 900px    | grade fluida (`auto-fill`)    |

Nenhuma das faixas apresenta rolagem horizontal.

---

## Desempenho

* Sem dependências externas, sem framework e sem build step.
* Fonte do sistema — nenhum arquivo de fonte é baixado.
* Imagens com `width`/`height` explícitos, o que evita deslocamento de layout (CLS).
* Os primeiros cards de cada lista carregam com `loading="eager"` e
  `fetchpriority="high"`; o restante usa `loading="lazy"`. Aplicar lazy loading
  à maior imagem visível atrasaria o LCP.
* A busca do catálogo usa debounce de 300ms, para não disparar uma requisição
  por tecla digitada.

---

## Persistência de dados

O jardim é salvo no `localStorage` do navegador, na chave `solaris_meuJardim`.
Isso significa que:

* os dados ficam apenas no navegador e no dispositivo usado;
* limpar os dados do navegador apaga o jardim salvo;
* não há sincronização entre dispositivos — fora do escopo deste trabalho, que
  é um protótipo front-end estático sem backend.

---

## Checklist de boas práticas

| Item                                    | Situação |
|-----------------------------------------|----------|
| DOCTYPE HTML5 correto                   | ok       |
| Atributo `lang`                         | ok       |
| Meta viewport                           | ok       |
| Meta description                        | ok       |
| HTML sem erros no W3C Validator         | ok       |
| CSS sem erros no W3C Validator          | ok       |
| CSS externo separado do HTML            | ok       |
| Uso predominante de unidades relativas  | ok       |
| Imagens com `alt`                       | ok       |
| Imagens com `loading="lazy"`            | ok (exceto as de prioridade, por decisão de LCP) |
| Dimensões explícitas de imagens         | ok       |
| Uso de Flexbox e Grid                   | ok       |
| Ausência de estilos inline              | ok       |
| Ausência de IDs duplicados              | ok       |
| Ausência de links quebrados             | ok       |
| Foco visível                            | ok       |
| Contraste WCAG adequado                 | ok       |
| Labels associados a formulários         | ok       |
| Navegação por teclado funcional         | ok       |
| Estrutura semântica completa            | ok       |
| Uso de variáveis CSS (`:root`)          | ok       |

---

## Limitações conhecidas

* A chave da API Perenual fica exposta no código-fonte do front-end
  (`js/models/plantasModel.js`), porque o projeto não tem backend nem proxy para
  escondê-la. Em produção real ela deveria ficar em um servidor intermediário.
* O cálculo de humor da planta usa um intervalo fixo de dias sem rega, e não a
  frequência real recomendada por espécie — a API não fornece esse dado de forma
  padronizada.
* A simulação de crescimento é idealizada: usa apenas o tempo desde a adição, sem
  considerar clima, substrato ou condições reais de cultivo.
