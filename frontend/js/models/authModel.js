window.Solaris = window.Solaris || {};

(function (Solaris) {
  'use strict';

  async function usuarioAtual() {
    try {
      return await Solaris.api.get('/api/auth/eu');
    } catch (erro) {
      if (erro.status === 401) {
        return null;
      }
      throw erro;
    }
  }

  function entrar(email, senha) {
    return Solaris.api.post('/api/auth/login', { email: email, senha: senha });
  }

  function cadastrar(nome, email, senha) {
    return Solaris.api.post('/api/auth/cadastro', { nome: nome, email: email, senha: senha });
  }

  function sair() {
    return Solaris.api.post('/api/auth/logout');
  }

  Solaris.authModel = {
    usuarioAtual: usuarioAtual,
    entrar: entrar,
    cadastrar: cadastrar,
    sair: sair
  };
})(window.Solaris);