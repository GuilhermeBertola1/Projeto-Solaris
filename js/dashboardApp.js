(function (Solaris) {
  'use strict';

  const containerAtencao = document.getElementById('container-atencao');
  const containerTodas = document.getElementById('container-todas');

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
})(window.Solaris);
