/**
 * View do painel "Meu Jardim" (index.html).
 * Lê o estado do ViewModel e escreve o HTML dos cards no DOM.
 */
(function (Solaris) {
  'use strict';

  const containerAtencao = document.getElementById('container-atencao');
  const containerTodas = document.getElementById('container-todas');

  // Quantos cards carregam a imagem com prioridade alta (primeira dobra).
  const CARDS_PRIORITARIOS = 3;

  function listaDeCards(plantas) {
    return plantas.map(function (planta, indice) {
      return Solaris.views.cardPlanta(planta, {
        acao: 'link',
        mostrarHumor: true,
        prioritaria: indice < CARDS_PRIORITARIOS
      });
    }).join('');
  }

  function renderizarJardim(estado) {
    const precisamAtencao = estado.plantas.filter(function (planta) {
      return planta.humor !== 'feliz';
    });

    containerAtencao.innerHTML = precisamAtencao.length
      ? listaDeCards(precisamAtencao)
      : '<p class="mensagem-status">Nenhuma planta precisando de atenção agora.</p>';

    containerTodas.innerHTML = estado.plantas.length
      ? listaDeCards(estado.plantas)
      : '<p class="mensagem-status">Seu jardim está vazio. ' +
        '<a href="catalogo.html">Busque plantas no catálogo</a> e adicione a primeira.</p>';
  }

  Solaris.makeJardimViewModel(renderizarJardim);

  // Cards já estão no DOM: pode mostrar a página, sem salto de layout.
  Solaris.utils.revelarPagina();
})(window.Solaris);
