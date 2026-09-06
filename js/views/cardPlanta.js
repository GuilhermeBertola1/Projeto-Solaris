window.Solaris = window.Solaris || {};

(function (Solaris) {
  'use strict';

  const esc = Solaris.utils.escaparHTML;

  function blocoHumor(chaveHumor, grande) {
    const humor = Solaris.simulacaoModel.HUMOR_INFO[chaveHumor];
    if (!humor) {
      return '';
    }

    const tamanho = grande ? 96 : 40;
    const classeBloco = grande ? 'planta-humor planta-humor--grande' : 'planta-humor';
    const classeSprite = grande ? 'humor-sprite humor-sprite--grande' : 'humor-sprite';

    return '<p class="' + classeBloco + '">' +
      '<img class="' + classeSprite + '" src="' + esc(humor.sprite) + '" alt="" ' +
      'width="' + tamanho + '" height="' + tamanho + '" loading="lazy">' +
      '<span>' + esc(humor.label) + '</span>' +
      '</p>';
  }

  function cardPlanta(planta, opcoes) {
    const config = opcoes || {};

    const atributosImagem = config.prioritaria
      ? 'loading="eager" fetchpriority="high"'
      : 'loading="lazy"';

    const corpo = config.mostrarHumor
      ? blocoHumor(planta.humor, false)
      : '<p>Luz: ' + esc(planta.luz) + ' | Dificuldade: ' + esc(planta.dificuldade) + '</p>';

    const nomeParaLeitor = '<span class="visualmente-oculto"> — ' + esc(planta.nome) + '</span>';

    const acao = config.acao === 'botao'
      ? '<button type="button" class="botao" data-adicionar data-indice="' + Number(config.indice) + '">' +
        'Adicionar ao Jardim' + nomeParaLeitor + '</button>'
      : '<a class="botao" href="perfil.html?id=' + encodeURIComponent(planta.instanceId) + '">' +
        'Ver detalhes' + nomeParaLeitor + '</a>';

    return '' +
      '<article class="card-planta">' +
        '<figure>' +
          '<img src="' + esc(planta.foto) + '" alt="' + esc(planta.nome) + '" ' +
          'width="250" height="200" ' + atributosImagem + '>' +
          '<figcaption>' + esc(planta.especie) + '</figcaption>' +
        '</figure>' +
        '<h3>' + esc(planta.nome) + '</h3>' +
        corpo +
        acao +
      '</article>';
  }

  Solaris.views = Solaris.views || {};
  Solaris.views.cardPlanta = cardPlanta;
  Solaris.views.blocoHumor = blocoHumor;
})(window.Solaris);
