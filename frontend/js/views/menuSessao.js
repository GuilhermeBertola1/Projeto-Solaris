window.Solaris = window.Solaris || {};

(function (Solaris) {
  'use strict';

  const DESTINO_PERMITIDO = /^[a-z]+\.html(\?[a-z0-9=&_-]*)?$/i;

  function destinoSeguro(voltar) {
    return voltar && DESTINO_PERMITIDO.test(voltar) ? voltar : 'index.html';
  }

  function irParaLogin() {
    const paginaAtual = (window.location.pathname.split('/').pop() || 'index.html') +
      window.location.search;
    window.location.href = 'login.html?voltar=' + encodeURIComponent(paginaAtual);
  }

  function desenharMenu(usuario) {
    const lista = document.querySelector('header nav ul');
    if (!lista) {
      return;
    }

    const item = document.createElement('li');
    item.className = 'menu-sessao';

    if (usuario) {
      if (usuario.perfil === 'ADMIN') {
        const linkAdmin = document.createElement('a');
        linkAdmin.href = 'admin.html';
        linkAdmin.textContent = 'Administração';
        item.append(linkAdmin);
      }
      const saudacao = document.createElement('span');
      saudacao.textContent = 'Olá, ' + usuario.nome.split(' ')[0];

      const botaoSair = document.createElement('button');
      botaoSair.type = 'button';
      botaoSair.className = 'botao-link';
      botaoSair.textContent = 'Sair';
      botaoSair.addEventListener('click', async function () {
        botaoSair.disabled = true;
        try {
          await Solaris.authModel.sair();
        } finally {
          window.location.href = 'login.html';
        }
      });

      item.append(saudacao, botaoSair);
    } else {
      const linkEntrar = document.createElement('a');
      linkEntrar.href = 'login.html';
      linkEntrar.textContent = 'Entrar';
      item.append(linkEntrar);
    }

    lista.appendChild(item);
  }

  async function iniciar() {
    const exigeLogin = document.body.hasAttribute('data-exige-login');

    let usuario = null;
    try {
      usuario = await Solaris.authModel.usuarioAtual();
    } catch (erro) {
      console.warn('Não foi possível verificar a sessão.', erro);
    }

    if (exigeLogin && !usuario) {
      irParaLogin();
      return null;
    }

    desenharMenu(usuario);
    return usuario;
  }

  Solaris.sessao = {
    destinoSeguro: destinoSeguro,
    irParaLogin: irParaLogin,
    pronta: iniciar()
  };
})(window.Solaris);