window.Solaris = window.Solaris || {};

(function (Solaris) {
  'use strict';

  const TAMANHO_PAGINA = 24;

  const ROTULOS_DIFICULDADE = {
    MUITO_FACIL: 'Muito fácil',
    FACIL: 'Fácil',
    MEDIA: 'Média',
    DIFICIL: 'Difícil'
  };

  function paraPlantaDaTela(especie) {
    return {
      id: especie.id,
      nome: especie.nomePopular,
      especie: especie.nomeCientifico,
      luz: especie.luz || 'Não informada',
      dificuldade: ROTULOS_DIFICULDADE[especie.dificuldade] || especie.dificuldade,
      categoria: especie.categoria,
      rotuloCategoria: especie.categoriaRotulo,
      regimeRega: especie.regimeRega,
      intervaloRegaDias: especie.intervaloRegaDias,
      foto: Solaris.imagemModel.normalizarFoto(especie.fotoUrl)
    };
  }

  async function obterPlantas(termo, pagina) {
    const parametros = new URLSearchParams({
      pagina: String(pagina || 0),
      tamanho: String(TAMANHO_PAGINA)
    });
    if (termo && termo.trim()) {
      parametros.set('q', termo.trim());
    }

    const resposta = await Solaris.api.get('/api/especies?' + parametros.toString());

    return {
      plantas: resposta.itens.map(paraPlantaDaTela),
      temMais: resposta.pagina + 1 < resposta.totalPaginas
    };
  }

  Solaris.plantasModel = {
    obterPlantas: obterPlantas,
    paraPlantaDaTela: paraPlantaDaTela,
    ROTULOS_DIFICULDADE: ROTULOS_DIFICULDADE
  };
})(window.Solaris);