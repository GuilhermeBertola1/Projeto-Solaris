# Projeto Solaris ☀️🌱

Um sistema web de gerenciamento e simulação de cultivo de plantas, com o objetivo em ajudar os usuários a acompanhar o desenvolvimento de suas plantas de forma visual e intuitiva. 

Este projeto foi desenvolvido com foco estrito em engenharia de interface, englobando semântica web, responsividade, acessibilidade e alto desempenho.

---

## 🎯 Objetivo do Projeto
Muitas pessoas desistem de cultivar plantas por ansiedade ou falta de conhecimento sobre o tempo natural de crescimento de cada espécie. O **Projeto Solaris** resolve isso oferecendo uma interface onde o usuário pode adicionar plantas ao seu jardim virtual e visualizar uma **simulação idealizada em linha do tempo** (desde a germinação até a colheita/fase adulta). 

O objetivo técnico é entregar uma UI (User Interface) limpa, acessível e responsiva, garantindo uma excelente experiência de usuário (UX) em qualquer dispositivo.

---

## ⚙️ Principais Funcionalidades
*   **Catálogo de Busca:** Permite procurar espécies de plantas (dados simulados via mock no Front-end) e visualizar necessidades de luz e água.
*   **Dashboard (Meu Jardim):** Painel de controle principal onde o usuário gerencia as plantas que possui, recebendo alertas visuais (ex: necessidade de rega).
*   **Perfil e Simulação:** Uma visualização em linha do tempo detalhando o estágio atual de desenvolvimento da planta e os próximos passos do cultivo.

---

## 🛠️ Tecnologias e Padrões Utilizados
Este projeto foi construído sem o uso de frameworks externos para priorizar o domínio dos fundamentos da web:
*   **HTML5 Semântico:** Estruturação rigorosa utilizando tags apropriadas (`<header>`, `<main>`, `<article>`, `<section>`, etc.) para maximizar a interpretação por leitores de tela e motores de busca.
*   **CSS3 Moderno:** 
    *   Uso de **Variáveis (Custom Properties)** para controle global de temas (paleta de 6 cores estritas).
    *   Layouts fluidos construídos com **CSS Grid** e **Flexbox**.
    *   Unidades relativas (`rem`, `%`, `vh`) para garantir adaptação de tipografia e espaçamento.
*   **Acessibilidade (WCAG 2.2 AA):** Foco visível por teclado, contraste rigoroso, hierarquia lógica de títulos (`h1`-`h6`) e atributos ARIA e textos alternativos (`alt`) implementados.
*   **Desempenho Otimizado:** Imagens dimensionadas com `loading="lazy"` para alcançar métricas de excelência no Google Lighthouse.

---

## 🚀 Instruções de Execução

O Projeto Solaris foi construído para ser um protótipo funcional estático (Mockup Funcional) no Front-end e não requer a instalação de servidores locais, Node.js ou bancos de dados complexos.

Para executar e testar o projeto localmente:

1. Faça o clone deste repositório em sua máquina local:
   ```bash
   git clone [https://github.com/SEU_USUARIO/projeto-solaris.git](https://github.com/SEU_USUARIO/projeto-solaris.git)
