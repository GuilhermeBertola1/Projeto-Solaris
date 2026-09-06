(function (Solaris) {
  'use strict';

  const esc = Solaris.utils.escaparHTML;

  const params = new URLSearchParams(window.location.search);
  const instanceId = params.get('id');

  const elTitulo = document.getElementById('titulo-planta');
  const elConteudo = document.getElementById('conteudo-perfil');
  const elFeedback = document.getElementById('feedback-rega');

  let viewModel = null;

  let devolverFocoAoBotao = false;

  function mensagemDeErro(texto) {
    return '<p class="mensagem-status">' + texto +
      ' <a href="index.html">Voltar para Meu Jardim</a></p>';
  }

  function listaDeFases(faseAtual) {
    return Solaris.simulacaoModel.ORDEM_FASES.map(function (chave) {
      const info = Solaris.simulacaoModel.FASES_INFO[chave];
      const atual = chave === faseAtual;

      return '<li class="' + (atual ? 'fase-atual' : '') + '">' +
        '<h3>' + esc(info.titulo) + (atual ? ' — Você está aqui' : '') + '</h3>' +
        '<p>' + esc(info.descricao) + '</p>' +
        '</li>';
    }).join('');
  }

  function renderizar(estado) {
    if (!estado.encontrada) {
      elTitulo.textContent = 'Planta não encontrada';
      elConteudo.innerHTML = mensagemDeErro('Não encontramos essa planta no seu jardim.');
      return;
    }

    if (!estado.planta) {
      return;
    }

    const planta = estado.planta;
    elTitulo.textContent = 'Perfil da planta: ' + planta.nome;

    elConteudo.innerHTML = '' +
      '<section class="secao-info-basica">' +
        '<h2>Informações</h2>' +
        '<figure>' +
          '<img src="' + esc(planta.foto) + '" alt="' + esc(planta.nome) + '" ' +
          'width="400" height="300" loading="eager" fetchpriority="high">' +
          '<figcaption>' + esc(planta.especie) + '</figcaption>' +
        '</figure>' +
        '<ul>' +
          '<li><strong>Luz ideal:</strong> ' + esc(planta.luz) + '</li>' +
          '<li><strong>Dificuldade:</strong> ' + esc(planta.dificuldade) + '</li>' +
          '<li><strong>No jardim há:</strong> ' + planta.diasDePlantada + ' dia(s)</li>' +
        '</ul>' +
      '</section>' +
      '<section class="secao-simulacao">' +
        '<h2>Simulação de crescimento da planta</h2>' +
        Solaris.views.blocoHumor(planta.humor, true) +
        '<button type="button" class="botao" id="btn-regar">Reguei hoje</button>' +
        '<ol>' + listaDeFases(planta.fase) + '</ol>' +
      '</section>';

    const botaoRegar = document.getElementById('btn-regar');
    botaoRegar.addEventListener('click', function () {
      devolverFocoAoBotao = true;
      viewModel.regar();

      if (elFeedback && viewModel.estado.planta) {
        const humorAtual = Solaris.simulacaoModel.HUMOR_INFO[viewModel.estado.planta.humor];
        elFeedback.textContent = 'Rega registrada. Estado da planta: ' + humorAtual.label + '.';
      }
    });

    if (devolverFocoAoBotao) {
      devolverFocoAoBotao = false;
      botaoRegar.focus();
    }
  }

  if (!instanceId) {
    elTitulo.textContent = 'Planta não encontrada';
    elConteudo.innerHTML = mensagemDeErro('Nenhuma planta foi informada no endereço da página.');
  } else {
    viewModel = Solaris.makePerfilViewModel(instanceId, renderizar);
  }
})(window.Solaris);
