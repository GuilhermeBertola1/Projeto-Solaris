(function (Solaris) {
  'use strict';

  const form = document.getElementById('form-cadastro');
  const botao = form.querySelector('button[type="submit"]');

  Solaris.sessao.pronta.then(function (usuario) {
    if (usuario) {
      window.location.href = 'index.html';
    }
  });

  form.addEventListener('submit', async function (evento) {
    evento.preventDefault();
    Solaris.formulario.limparErros(form);

    const nome = form.elements.nome.value;
    const email = form.elements.email.value;
    const senha = form.elements.senha.value;

    if (senha !== form.elements.confirmacao.value) {
      Solaris.formulario.mostrarErros(form, {
        campos: { confirmacao: 'As senhas não conferem.' }
      });
      return;
    }

    botao.disabled = true;
    try {
      await Solaris.authModel.cadastrar(nome, email, senha);
      await Solaris.authModel.entrar(email, senha);
      window.location.href = 'index.html';
    } catch (erro) {
      Solaris.formulario.mostrarErros(form, erro);
    } finally {
      botao.disabled = false;
    }
  });
})(window.Solaris);