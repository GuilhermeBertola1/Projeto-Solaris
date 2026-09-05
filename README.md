# Projeto Solaris ☀️🌱

Um sistema web de gerenciamento e simulação de cultivo de plantas, com o objetivo em ajudar os usuários a acompanhar o desenvolvimento de suas plantas de forma visual e intuitiva.

Este projeto foi desenvolvido com foco estrito em engenharia de interface, englobando semântica web, responsividade, acessibilidade e alto desempenho.

---

## 🎯 Objetivo do Projeto
Muitas pessoas desistem de cultivar plantas por ansiedade ou falta de conhecimento sobre o tempo natural de crescimento de cada espécie. O **Projeto Solaris** resolve isso oferecendo uma interface onde o usuário pode adicionar plantas ao seu jardim virtual e visualizar uma **simulação idealizada em linha do tempo** (desde a germinação até a fase adulta), incluindo um indicador de "humor" da planta inspirado em um tamagotchi digital.

O objetivo técnico é entregar uma UI (User Interface) limpa, acessível e responsiva, garantindo uma excelente experiência de usuário (UX) em qualquer dispositivo.

---

## ⚙️ Principais Funcionalidades
* **Catálogo de Busca:** Permite procurar espécies de plantas (via API Perenual, com fallback para um banco de dados local simulado no Front-end) e adicioná-las ao jardim virtual.
* **Dashboard (Meu Jardim):** Painel de controle principal onde o usuário acompanha as plantas que adicionou, com destaque automático para as que precisam de rega.
* **Perfil e Simulação:** Uma visualização em linha do tempo detalhando o estágio atual de desenvolvimento da planta (Brotação → Crescimento Vegetativo → Fase Adulta) e o "humor" atual dela, calculado a partir de quando foi regada pela última vez. O botão "Reguei hoje" atualiza esse estado.

---

## 🛠️ Tecnologias e Padrões Utilizados
Este projeto foi construído sem o uso de frameworks externos para priorizar o domínio dos fundamentos da web:
* **HTML5 Semântico:** Estruturação rigorosa utilizando tags apropriadas (`<header>`, `<main>`, `<article>`, `<section>`, etc.) para maximizar a interpretação por leitores de tela e motores de busca.
* **CSS3 Moderno:**
  * Uso de **Variáveis (Custom Properties)** para controle global de temas (paleta de cores estritas).
  * Layouts fluidos construídos com **CSS Grid** e **Flexbox**.
  * Unidades relativas (`rem`, `%`, `vh`) para garantir adaptação de tipografia e espaçamento.
* **JavaScript (ES Modules) com padrão MVVM próprio:**
  * **Model** (`js/models`): acesso a dados — API Perenual + fallback local (`plantasModel.js`, `dados_locais.js`), persistência do jardim do usuário em `localStorage` (`jardimModel.js`) e regras de simulação de crescimento/humor (`simulacaoModel.js`).
  * **ViewModel** (`js/viewmodels`): estado reativo via `Proxy`, que dispara o re-render da View a cada mudança de estado, sem necessidade de framework.
  * **View** (`catalogoApp.js`, `dashboardApp.js`, `perfilApp.js`): manipulação direta do DOM a partir do estado do ViewModel.
* **Acessibilidade (WCAG 2.2 AA):** Foco visível por teclado, contraste rigoroso, hierarquia lógica de títulos (`h1`-`h6`), atributos ARIA (incluindo região `aria-live` para feedback de ações) e textos alternativos (`alt`) implementados.
* **Desempenho Otimizado:** Imagens dimensionadas com `loading="lazy"` para alcançar métricas de excelência no Google Lighthouse.

---

## 🚀 Instruções de Execução

O Projeto Solaris foi construído para ser um protótipo funcional estático (Mockup Funcional) no Front-end e não requer a instalação de servidores locais, Node.js ou bancos de dados complexos.

Para executar e testar o projeto localmente:

1. Faça o clone deste repositório em sua máquina local:
   ```bash
   git clone https://github.com/SEU_USUARIO/projeto-solaris.git
   ```
2. Abra o arquivo `index.html` diretamente em um navegador moderno (Chrome, Firefox ou Edge).

> **Nota técnica:** este projeto usa ES Modules (`import`/`export`) nos arquivos JavaScript. Alguns navegadores bloqueiam o carregamento de módulos quando o HTML é aberto via `file://` (erro de CORS). Se isso ocorrer no seu navegador, use uma extensão de servidor local (ex.: "Live Server" no VS Code) apenas para desenvolvimento/testes — isso não altera o código entregue, que continua sendo HTML/CSS/JS puro sem build step.

## 💾 Persistência de dados

O "Meu Jardim" é salvo no `localStorage` do navegador (chave `solaris_meuJardim`). Isso significa que:
- os dados ficam apenas no navegador/dispositivo usado;
- limpar o cache do navegador apaga o jardim salvo;
- não há sincronização entre dispositivos (fora do escopo deste trabalho, que é um protótipo front-end estático sem backend).

## ⚠️ Limitações conhecidas

- A chave da API Perenual está exposta no código-fonte do front-end (`js/models/plantasModel.js`), pois o projeto não possui backend/proxy para escondê-la. Em um cenário de produção real, essa chave deveria ficar em um servidor intermediário.
- O cálculo de "humor" da planta usa um intervalo fixo de dias sem rega (não a frequência real de rega recomendada por espécie, que a API não fornece de forma padronizada).