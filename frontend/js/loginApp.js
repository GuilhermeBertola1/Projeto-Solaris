(function (Solaris) {
  'use strict';

  const form = document.getElementById('form-login');
  const botao = form.querySelector('button[type="submit"]');
  const voltar = new URLSearchParams(window.location.search).get('voltar');

  // Quem já está logado não precisa ver o formulário.
  Solaris.sessao.pronta.then(function (usuario) {
    if (usuario) {
      window.location.href = Solaris.sessao.destinoSeguro(voltar);
    }
  });

  form.addEventListener('submit', async function (evento) {
    evento.preventDefault();
    Solaris.formulario.limparErros(form);
    botao.disabled = true;

    try {
      await Solaris.authModel.entrar(form.elements.email.value, form.elements.senha.value);
      window.location.href = Solaris.sessao.destinoSeguro(voltar);
    } catch (erro) {
      form.elements.senha.value = '';
      Solaris.formulario.mostrarErros(form, erro);
    } finally {
      botao.disabled = false;
    }
  });
})(window.Solaris);