/**
 * Projeto Solaris — utilitários compartilhados.
 *
 * O projeto usa um namespace global (window.Solaris) no lugar de ES Modules.
 * Motivo: os navegadores bloqueiam import/export quando o HTML é aberto pelo
 * protocolo file://, e o requisito do trabalho é que o projeto rode apenas
 * abrindo o arquivo principal no navegador, sem servidor local.
 */
window.Solaris = window.Solaris || {};

(function (Solaris) {
  'use strict';

  const MAPA_ESCAPE = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  /**
   * Escapa texto de origem externa (API Perenual) antes de injetá-lo no DOM
   * via innerHTML, evitando que um nome de planta com HTML quebre a página.
   * @param {*} valor
   * @returns {string}
   */
  function escaparHTML(valor) {
    const texto = (valor === undefined || valor === null) ? '' : String(valor);
    return texto.replace(/[&<>"']/g, function (caractere) {
      return MAPA_ESCAPE[caractere];
    });
  }

  /**
   * Adia a execução de uma função até que ela pare de ser chamada por
   * `espera` milissegundos. Usado na busca do catálogo para não disparar
   * uma requisição a cada tecla digitada.
   * @param {Function} funcao
   * @param {number} espera
   * @returns {Function}
   */
  function debounce(funcao, espera) {
    let temporizador = null;
    return function () {
      const argumentos = arguments;
      const contexto = this;
      clearTimeout(temporizador);
      temporizador = setTimeout(function () {
        funcao.apply(contexto, argumentos);
      }, espera);
    };
  }

  /**
   * Revela o conteúdo depois que a View terminou a primeira montagem.
   * O par disto é o script no <head>, que esconde o <main> até aqui.
   */
  function revelarPagina() {
    document.documentElement.classList.remove('js-montando');
  }

  Solaris.utils = {
    escaparHTML: escaparHTML,
    debounce: debounce,
    revelarPagina: revelarPagina
  };
})(window.Solaris);
