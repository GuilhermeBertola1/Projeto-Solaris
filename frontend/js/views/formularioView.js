window.Solaris = window.Solaris || {};

(function (Solaris) {
  'use strict';

  const MENSAGEM_SEM_CONEXAO = 'Não foi possível falar com o servidor. Tente novamente.';

  function limparErros(form) {
    form.querySelectorAll('.erro-campo').forEach(function (elemento) {
      elemento.textContent = '';
    });
    form.querySelectorAll('[aria-invalid]').forEach(function (elemento) {
      elemento.removeAttribute('aria-invalid');
    });

    const geral = form.querySelector('.mensagem-erro');
    if (geral) {
      geral.textContent = '';
      geral.hidden = true;
    }
  }

  function mostrarErros(form, erro) {
    const campos = (erro && erro.campos) || {};
    let mostrouEmCampo = false;

    Object.keys(campos).forEach(function (nome) {
      const destino = form.querySelector('#erro-' + nome);
      const entrada = form.elements[nome];

      if (destino) {
        destino.textContent = campos[nome];
        mostrouEmCampo = true;
      }
      if (entrada) {
        entrada.setAttribute('aria-invalid', 'true');
      }
    });

    if (!mostrouEmCampo) {
      const geral = form.querySelector('.mensagem-erro');
      geral.textContent = erro instanceof Solaris.api.ErroApi ? erro.message : MENSAGEM_SEM_CONEXAO;
      geral.hidden = false;
    }

    const primeiroInvalido = form.querySelector('[aria-invalid="true"]');
    if (primeiroInvalido) {
      primeiroInvalido.focus();
    }
  }

  Solaris.formulario = {
    limparErros: limparErros,
    mostrarErros: mostrarErros
  };
})(window.Solaris);