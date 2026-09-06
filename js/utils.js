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

  function escaparHTML(valor) {
    const texto = (valor === undefined || valor === null) ? '' : String(valor);
    return texto.replace(/[&<>"']/g, function (caractere) {
      return MAPA_ESCAPE[caractere];
    });
  }

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

  Solaris.utils = { escaparHTML: escaparHTML, debounce: debounce };
})(window.Solaris);
