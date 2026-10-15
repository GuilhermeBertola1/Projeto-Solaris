(function (Solaris) {
  'use strict';

  const esc = Solaris.utils.escaparHTML;

  const inputBusca = document.getElementById('busca');
  const formBusca = document.getElementById('form-busca');
  const containerResultados = document.getElementById('container-resultados');
  const botaoMais = document.getElementById('btn-mais');
  const feedback = document.getElementById('feedback-jardim');

  const ESPERA_BUSCA = 300;
  const CARDS_PRIORITARIOS = 3;

  function mensagem(texto) {
    containerResultados.innerHTML = '<p class="mensagem-status">' + texto + '</p>';
    botaoMais.hidden = true;
  }

  function renderizarResultados(estado) {
    if (estado.erro) {
      mensagem(esc(estado.erro));
      return;
    }

    if (estado.plantas.length === 0) {
      mensagem(estado.carregando
        ? 'Carregando plantas...'
        : 'Nenhuma planta encontrada para "' + esc(estado.termoBusca) + '".');
      return;
    }

    containerResultados.classList.add('pronto');
    containerResultados.innerHTML = estado.plantas.map(function (planta, indice) {
      return Solaris.views.cardPlanta(planta, {
        acao: 'botao',
        indice: indice,
        prioritaria: indice < CARDS_PRIORITARIOS
      });
    }).join('');

    botaoMais.hidden = !estado.temMais;
    botaoMais.disabled = estado.carregando;
    botaoMais.textContent = estado.carregando ? 'Carregando...' : 'Mostrar mais plantas';
  }

  const viewModel = Solaris.makeCatalogoViewModel(renderizarResultados);

  const buscarComAtraso = Solaris.utils.debounce(function (termo) {
    viewModel.buscar(termo);
  }, ESPERA_BUSCA);

  inputBusca.addEventListener('input', function (evento) {
    buscarComAtraso(evento.target.value);
  });

  formBusca.addEventListener('submit', function (evento) {
    evento.preventDefault();
    viewModel.buscar(inputBusca.value);
  });

  botaoMais.addEventListener('click', function () {
    viewModel.carregarMais();
  });

  // Delegação de evento: um único listener cobre todos os botões
  // "Adicionar ao Jardim", inclusive os recriados a cada busca.
  containerResultados.addEventListener('click', async function (evento) {
    const botao = evento.target.closest('button[data-adicionar]');
    if (!botao) {
      return;
    }

    const planta = viewModel.estado.plantas[Number(botao.dataset.indice)];
    if (!planta) {
      return;
    }

    const usuario = await Solaris.sessao.pronta;
    if (!usuario) {
      Solaris.sessao.irParaLogin();
      return;
    }

    botao.disabled = true;
    try {
      await Solaris.jardimModel.plantar(planta.id);
      botao.textContent = 'Adicionado';
      if (feedback) {
        feedback.textContent = planta.nome + ' foi adicionada ao seu jardim.';
      }
    } catch (erro) {
      if (erro.status === 401) {
        Solaris.sessao.irParaLogin();
        return;
      }
      botao.disabled = false;
      botao.textContent = 'Tentar de novo';
      if (feedback) {
        feedback.textContent = 'Não foi possível adicionar ' + planta.nome + '. ' + erro.message;
      }
    }
  });

  viewModel.buscar('');
})(window.Solaris);