window.Solaris = window.Solaris || {};

(function (Solaris) {
  'use strict';

  const TAMANHO_PAGINA = 50;
  const TAMANHO_HISTORICO = 10;

  // O servidor manda o humor em maiúsculas (enum Java); as Views usam minúsculas.
  const HUMORES = { FELIZ: 'feliz', ATENCAO: 'atencao', SEDENTA: 'sedenta' };

  function paraPlantaDoJardim(resposta) {
    const especie = Solaris.plantasModel.paraPlantaDaTela(resposta.especie);
    const estado = resposta.estado;
    const simulacao = Solaris.simulacaoModel;

    const progresso = simulacao.calcularProgresso(estado.fase, estado.diasDePlantada);
    progresso.percentual = estado.progressoFase;

    return Object.assign({}, especie, {
      instanceId: resposta.id,
      especieId: especie.id,
      nome: resposta.apelido || especie.nome,
      apelido: resposta.apelido,
      nomeEspecie: especie.nome,
      dataPlantio: resposta.dataPlantio,
      diasDePlantada: estado.diasDePlantada,
      fase: estado.fase,
      humor: HUMORES[estado.humor],
      intervaloRega: estado.intervaloRegaDias,
      diasAteProximaRega: estado.diasAteProximaRega,
      ultimaRega: estado.ultimaRega,
      textoRega: simulacao.regimeDeRega(especie).texto,
      progresso: progresso
    });
  }

  function caminhoDaPlanta(id) {
    return '/api/plantas/' + encodeURIComponent(id);
  }

  async function obterJardim() {
    let pagina = 0;
    let totalPaginas = 1;
    let plantas = [];

    while (pagina < totalPaginas) {
      const resposta = await Solaris.api.get(
        '/api/plantas?pagina=' + pagina + '&tamanho=' + TAMANHO_PAGINA);
      plantas = plantas.concat(resposta.itens.map(paraPlantaDoJardim));
      totalPaginas = resposta.totalPaginas;
      pagina++;
    }
    return plantas;
  }

  async function obterPlantaDoJardim(id) {
    try {
      return paraPlantaDoJardim(await Solaris.api.get(caminhoDaPlanta(id)));
    } catch (erro) {
      if (erro.status === 404 || erro.status === 400) {
        return null;
      }
      throw erro;
    }
  }

  async function obterHistoricoDeRegas(id) {
    const resposta = await Solaris.api.get(
      caminhoDaPlanta(id) + '/regas?tamanho=' + TAMANHO_HISTORICO);
    // A API devolve da mais recente para a mais antiga; a View espera o contrário.
    return resposta.itens.map(function (rega) { return rega.regadaEm; }).reverse();
  }

  async function regarPlanta(id) {
    return paraPlantaDoJardim(await Solaris.api.post(caminhoDaPlanta(id) + '/regas'));
  }

  function removerDoJardim(id) {
    return Solaris.api.excluir(caminhoDaPlanta(id));
  }

  function hojeISO() {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return hoje.getFullYear() + '-' + mes + '-' + dia;
  }

  function plantar(especieId, apelido) {
    return Solaris.api.post('/api/plantas', {
      especieId: especieId,
      apelido: apelido || null,
      dataPlantio: hojeISO()
    });
  }

  Solaris.jardimModel = {
    obterJardim: obterJardim,
    obterPlantaDoJardim: obterPlantaDoJardim,
    obterHistoricoDeRegas: obterHistoricoDeRegas,
    regarPlanta: regarPlanta,
    removerDoJardim: removerDoJardim,
    plantar: plantar
  };
})(window.Solaris);