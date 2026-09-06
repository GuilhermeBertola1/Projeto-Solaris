window.Solaris = window.Solaris || {};

(function (Solaris) {
  'use strict';

  const API_KEY = 'sk-CsNR6a805dcfa54f519383';
  const API_URL_BASE = 'https://perenual.com/api/species-list';

  const API_DISPONIVEL = (
    window.location.protocol === 'http:' ||
    window.location.protocol === 'https:'
  );

  function normalizarItemDaApi(item) {
    return {
      id: item.id,
      nome: item.common_name || 'Planta Desconhecida',
      especie: (item.scientific_name && item.scientific_name[0]) || 'Sem nome científico',
      luz: Array.isArray(item.sunlight) ? item.sunlight.join(', ') : (item.sunlight || 'Não informada'),
      dificuldade: item.watering || 'Média',
      foto: (item.default_image && item.default_image.thumbnail) || 'assets/images/placeholder.jpg'
    };
  }

  function buscarNoBancoLocal(termo) {
    const alvo = termo.toLowerCase();
    return Solaris.PLANTAS_LOCAIS.filter(function (planta) {
      return planta.nome.toLowerCase().includes(alvo) ||
             planta.especie.toLowerCase().includes(alvo);
    });
  }

  async function obterPlantas(termo) {
    const busca = termo || '';

    if (!API_DISPONIVEL) {
      return buscarNoBancoLocal(busca);
    }

    const url = API_URL_BASE + '?key=' + API_KEY + '&q=' + encodeURIComponent(busca);

    try {
      const resposta = await fetch(url);
      if (!resposta.ok) {
        throw new Error('Conexão com a API falhou');
      }

      const resultado = await resposta.json();
      return resultado.data.map(normalizarItemDaApi);
    } catch (erro) {
      console.warn('API indisponível. Utilizando banco de dados local:', erro);
      return buscarNoBancoLocal(busca);
    }
  }

  Solaris.plantasModel = { obterPlantas: obterPlantas };
})(window.Solaris);
