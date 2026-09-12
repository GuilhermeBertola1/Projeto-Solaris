/**
 * View do catálogo (catalogo.html).
 * Liga o formulário de busca ao ViewModel e trata a adição ao jardim.
 */
(function (Solaris) {
  'use strict';

  const inputBusca = document.getElementById('busca');
  const formBusca = document.getElementById('form-busca');
  const containerResultados = document.getElementById('container-resultados');
  const feedback = document.getElementById('feedback-jardim');

  // Espera entre a última tecla digitada e a busca, em milissegundos.
  const ESPERA_BUSCA = 300;

  // Quantos cards carregam a imagem com prioridade alta (primeira dobra).
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

    // Os cards já ocupam o espaço: a altura reservada não é mais necessária.
    containerResultados.classList.add('pronto');

    containerResultados.innerHTML = estado.plantas.map(function (planta, indice) {
      return Solaris.views.cardPlanta(planta, {
        acao: 'botao',
        indice: indice,
        prioritaria: indice < CARDS_PRIORITARIOS
      });
    }).join('');
  }

  const viewModel = Solaris.makeCatalogoViewModel(renderizarResultados);

  // Busca enquanto o usuário digita, mas só depois que ele para — sem o
  // debounce seria uma requisição por tecla.
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

  // Delegação de evento: um único listener no container cobre todos os botões
  // "Adicionar ao Jardim", inclusive os recriados a cada nova busca.
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

    const entrada = Solaris.jardimModel.adicionarAoJardim(planta);

    botao.textContent = 'Adicionado';
    botao.disabled = true;

    // Região aria-live: anuncia a ação a leitores de tela sem usar alert().
    if (feedback) {
      feedback.textContent = planta.nome + ' foi adicionada ao seu jardim.';
    }

    // A planta já está salva; a cópia da foto vem em segundo plano para não
    // travar a interface. As URLs da API expiram em 24h (assinatura AWS), então
    // guardamos a imagem junto dos dados — ver js/models/imagemModel.js.
    Solaris.imagemModel.capturarComoDataUri(planta.foto).then(function (dataUri) {
      if (dataUri) {
        Solaris.jardimModel.atualizarFoto(entrada.instanceId, dataUri);
      }
    });
  });

  // Busca inicial com termo vazio, para a página já abrir com sugestões.
  viewModel.buscar('');
})(window.Solaris);
