window.Solaris = window.Solaris || {};

(function (Solaris) {
  'use strict';

  const METODOS_SEGUROS = ['GET', 'HEAD', 'OPTIONS'];

  class ErroApi extends Error {
    constructor(status, problema) {
      super((problema && problema.detail) || 'Não foi possível completar a operação.');
      this.name = 'ErroApi';
      this.status = status;
      this.titulo = (problema && problema.title) || '';
      this.campos = (problema && problema.campos) || {};
    }
  }

  function lerCookie(nome) {
    const prefixo = nome + '=';
    const par = document.cookie.split('; ').find(function (item) {
      return item.startsWith(prefixo);
    });
    return par ? decodeURIComponent(par.substring(prefixo.length)) : null;
  }

  let buscaDeToken = null;

  async function obterTokenCsrf() {
    const existente = lerCookie('XSRF-TOKEN');
    if (existente) {
      return existente;
    }

    if (!buscaDeToken) {
      buscaDeToken = fetch('/api/auth/csrf', { credentials: 'same-origin' })
        .then(function (resposta) { return resposta.json(); })
        .then(function (dados) { return dados.token; })
        .finally(function () { buscaDeToken = null; });
    }
    return buscaDeToken;
  }

  async function requisitar(metodo, caminho, corpo) {
    const cabecalhos = { 'Accept': 'application/json' };

    if (corpo !== undefined) {
      cabecalhos['Content-Type'] = 'application/json';
    }
    if (!METODOS_SEGUROS.includes(metodo)) {
      cabecalhos['X-XSRF-TOKEN'] = await obterTokenCsrf();
    }

    const resposta = await fetch(caminho, {
      method: metodo,
      headers: cabecalhos,
      credentials: 'same-origin',
      body: corpo === undefined ? undefined : JSON.stringify(corpo)
    });

    const texto = await resposta.text();
    let dados = null;
    if (texto) {
      try {
        dados = JSON.parse(texto);
      } catch (erro) {
        dados = null;
      }
    }

    if (!resposta.ok) {
      throw new ErroApi(resposta.status, dados);
    }
    return dados;
  }

  Solaris.api = {
    get: function (caminho) { return requisitar('GET', caminho); },
    post: function (caminho, corpo) { return requisitar('POST', caminho, corpo); },
    put: function (caminho, corpo) { return requisitar('PUT', caminho, corpo); },
    patch: function (caminho, corpo) { return requisitar('PATCH', caminho, corpo); },
    excluir: function (caminho) { return requisitar('DELETE', caminho); },
    ErroApi: ErroApi
  };
})(window.Solaris);