(function (Solaris) {
  'use strict';

  const esc = Solaris.utils.escaparHTML;
  const simulacao = Solaris.simulacaoModel;

  const params = new URLSearchParams(window.location.search);
  const instanceId = params.get('id');

  const elTitulo = document.getElementById('titulo-planta');
  const elConteudo = document.getElementById('conteudo-perfil');
  const elFeedback = document.getElementById('feedback-rega');

  let viewModel = null;

  let devolverFocoAoBotao = false;

  let confirmandoRemocao = false;

  const FORMATO_DATA = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

  function mensagemDeErro(texto) {
    return '<p class="mensagem-status">' + texto +
      ' <a href="index.html">Voltar para Meu Jardim</a></p>';
  }

  function barraDeProgresso(planta) {
    const p = planta.progresso;

    const texto = p.totalDaFase
      ? 'Dia ' + p.diaNaFase + ' de ' + p.totalDaFase + ' nesta fase'
      : 'Fase final, sem prazo de término';

    return '' +
      '<div class="progresso">' +
        '<div class="progresso-rotulo">' +
          '<span>' + esc(simulacao.LIMITES_FASE[planta.fase].rotulo) + '</span>' +
          '<span>' + esc(texto) + '</span>' +
        '</div>' +
        '<div class="progresso-trilho" role="progressbar" ' +
          'aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + p.percentual + '" ' +
          'aria-valuetext="' + esc(texto) + '">' +
          '<div class="progresso-preenchimento" style="width:' + p.percentual + '%"></div>' +
        '</div>' +
      '</div>';
  }

  function fichaDeCuidados(planta) {
    const rega = simulacao.descreverProximaRega(planta);

    return '' +
      '<dl class="ficha-cuidados">' +
        '<div><dt>Tipo</dt><dd>' + esc(planta.rotuloCategoria) + '</dd></div>' +
        '<div><dt>Luz ideal</dt><dd>' + esc(planta.luz) + '</dd></div>' +
        '<div><dt>Rega</dt><dd>' + esc(planta.textoRega) + '</dd></div>' +
        '<div><dt>Dificuldade</dt><dd>' + esc(planta.dificuldade) + '</dd></div>' +
        '<div><dt>No jardim há</dt><dd>' + planta.diasDePlantada + ' dia(s)</dd></div>' +
        '<div><dt>Próxima rega</dt>' +
          '<dd class="' + (rega.atrasada ? 'destaque-atencao' : '') + '">' + esc(rega.texto) + '</dd>' +
        '</div>' +
      '</dl>';
  }

  function historicoDeRegas(planta) {
    const historico = (planta.historicoRegas || []).slice().reverse();

    if (historico.length === 0) {
      return '<p>Nenhuma rega registrada ainda.</p>';
    }

    const itens = historico.map(function (marca) {
      return '<li>' + esc(FORMATO_DATA.format(new Date(marca))) + '</li>';
    }).join('');

    return '<ol class="historico-regas">' + itens + '</ol>';
  }

  function listaDeFases(planta) {
    return simulacao.ORDEM_FASES.map(function (chave) {
      const info = simulacao.descreverFase(chave, planta);
      const atual = chave === planta.fase;

      return '<li class="' + (atual ? 'fase-atual' : '') + '">' +
        '<h3>' + esc(info.titulo) + (atual ? ' — Você está aqui' : '') + '</h3>' +
        '<p>' + esc(info.descricao) + '</p>' +
        '</li>';
    }).join('');
  }

  function blocoRemocao() {
    if (!confirmandoRemocao) {
      return '<button type="button" class="botao botao--perigo" id="btn-remover">' +
        'Remover do jardim</button>';
    }

    return '' +
      '<p class="aviso-remocao">Remover esta planta apaga o histórico de regas dela. Confirma?</p>' +
      '<div class="acoes-remocao">' +
        '<button type="button" class="botao botao--perigo" id="btn-confirmar-remocao">Sim, remover</button>' +
        '<button type="button" class="botao botao--secundario" id="btn-cancelar-remocao">Cancelar</button>' +
      '</div>';
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
    const humor = simulacao.HUMOR_INFO[planta.humor];

    elTitulo.textContent = 'Perfil da planta: ' + planta.nome;

    elConteudo.innerHTML = '' +
      '<section class="secao-info-basica">' +
        '<h2>Ficha da planta</h2>' +
        '<figure>' +
          '<img src="' + esc(planta.foto) + '" alt="' + esc(planta.nome) + '" ' +
          'width="' + Solaris.imagemModel.LARGURA + '" height="' + Solaris.imagemModel.ALTURA + '" ' +
          'loading="eager" fetchpriority="high">' +
          '<figcaption>' + esc(planta.especie) + '</figcaption>' +
        '</figure>' +
        fichaDeCuidados(planta) +
      '</section>' +

      '<section class="secao-simulacao">' +
        '<h2>Simulação de crescimento</h2>' +
        Solaris.views.blocoHumor(planta.humor, true) +
        barraDeProgresso(planta) +
        '<button type="button" class="botao" id="btn-regar">Reguei hoje</button>' +
        '<ol class="linha-do-tempo">' + listaDeFases(planta) + '</ol>' +
      '</section>' +

      '<section class="secao-historico">' +
        '<h2>Últimas regas</h2>' +
        historicoDeRegas(planta) +
        blocoRemocao() +
      '</section>';

    ligarAcoes(planta, humor);
  }

  function ligarAcoes(planta, humor) {
    const botaoRegar = document.getElementById('btn-regar');

    botaoRegar.addEventListener('click', function () {
      devolverFocoAoBotao = true;
      viewModel.regar();

      if (elFeedback && viewModel.estado.planta) {
        const novo = simulacao.HUMOR_INFO[viewModel.estado.planta.humor];
        const proxima = simulacao.descreverProximaRega(viewModel.estado.planta);
        elFeedback.textContent = 'Rega registrada. ' + novo.label + '. ' + proxima.texto + '.';
      }
    });

    const botaoRemover = document.getElementById('btn-remover');
    if (botaoRemover) {
      botaoRemover.addEventListener('click', function () {
        confirmandoRemocao = true;
        renderizar(viewModel.estado);
        const confirmar = document.getElementById('btn-confirmar-remocao');
        if (confirmar) {
          confirmar.focus();
        }
      });
    }

    const botaoConfirmar = document.getElementById('btn-confirmar-remocao');
    if (botaoConfirmar) {
      botaoConfirmar.addEventListener('click', function () {
        viewModel.remover();
        window.location.href = 'index.html';
      });
    }

    const botaoCancelar = document.getElementById('btn-cancelar-remocao');
    if (botaoCancelar) {
      botaoCancelar.addEventListener('click', function () {
        confirmandoRemocao = false;
        renderizar(viewModel.estado);
        const remover = document.getElementById('btn-remover');
        if (remover) {
          remover.focus();
        }
      });
    }

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
