/**
 * View do painel "Meu Jardim" (index.html).
 */
(function (Solaris) {
  'use strict';

  const esc = Solaris.utils.escaparHTML;

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
    if (estado.carregando) {
      return;
    }

    if (estado.erro) {
      containerAtencao.innerHTML = '';
      containerTodas.innerHTML = '<p class="mensagem-status">' + esc(estado.erro) + '</p>';
      Solaris.utils.revelarPagina();
      return;
    }

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

    Solaris.utils.revelarPagina();
  }

  Solaris.sessao.pronta.then(function (usuario) {
    if (!usuario) {
      return;
    }
    Solaris.makeJardimViewModel(renderizarJardim).carregar();
  });
})(window.Solaris);