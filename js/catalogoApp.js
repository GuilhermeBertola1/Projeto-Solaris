(function (Solaris) {
  'use strict';

  const inputBusca = document.getElementById('busca');
  const formBusca = document.getElementById('form-busca');
  const containerResultados = document.getElementById('container-resultados');
  const feedback = document.getElementById('feedback-jardim');

  const ESPERA_BUSCA = 300;

  const CARDS_PRIORITARIOS = 3;

  function renderizarResultados(estado) {
    if (estado.carregando) {
      containerResultados.innerHTML = '<p class="mensagem-status">Carregando plantas...</p>';
      return;
    }

    if (estado.plantas.length === 0) {
      containerResultados.innerHTML = '<p class="mensagem-status">Nenhuma planta encontrada para "' +
        Solaris.utils.escaparHTML(estado.termoBusca) + '".</p>';
      return;
    }

    containerResultados.innerHTML = estado.plantas.map(function (planta, indice) {
      return Solaris.views.cardPlanta(planta, {
        acao: 'botao',
        indice: indice,
        prioritaria: indice < CARDS_PRIORITARIOS
      });
    }).join('');
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

  containerResultados.addEventListener('click', function (evento) {
    const botao = evento.target.closest('button[data-adicionar]');
    if (!botao) {
      return;
    }

    const indice = Number(botao.dataset.indice);
    const planta = viewModel.estado.plantas[indice];
    if (!planta) {
      return;
    }

    Solaris.jardimModel.adicionarAoJardim(planta);

    botao.textContent = 'Adicionado';
    botao.disabled = true;

    if (feedback) {
      feedback.textContent = planta.nome + ' foi adicionada ao seu jardim.';
    }
  });

  viewModel.buscar('');
})(window.Solaris);
