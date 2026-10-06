window.Solaris = window.Solaris || {};

(function (Solaris) {
  'use strict';

  function makeCatalogoViewModel(onStateChange) {
    const estadoBase = {
      termoBusca: '',
      plantas: [],
      carregando: false
    };

    const estado = new Proxy(estadoBase, {
      set: function (alvo, propriedade, valor) {
        alvo[propriedade] = valor;
        onStateChange(estado);
        return true;
      }
    });

    let requisicaoAtual = 0;

    async function buscar(termo) {
      const minhaRequisicao = ++requisicaoAtual;

      estado.termoBusca = termo;
      estado.carregando = true;

      const resultados = await Solaris.plantasModel.obterPlantas(termo);

      if (minhaRequisicao !== requisicaoAtual) {
        return;
      }

      estado.plantas = resultados;
      estado.carregando = false;
    }

    return { estado: estado, buscar: buscar };
  }

  Solaris.makeCatalogoViewModel = makeCatalogoViewModel;
})(window.Solaris);
