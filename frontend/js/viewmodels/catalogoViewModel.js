window.Solaris = window.Solaris || {};

(function (Solaris) {
  'use strict';

  const MENSAGEM_FALHA = 'Não foi possível carregar o catálogo. Tente novamente em instantes.';

  function makeCatalogoViewModel(onStateChange) {
    const estadoBase = {
      termoBusca: '',
      plantas: [],
      pagina: 0,
      temMais: false,
      carregando: false,
      erro: null
    };

    const estado = new Proxy(estadoBase, {
      set: function (alvo, propriedade, valor) {
        alvo[propriedade] = valor;
        onStateChange(estado);
        return true;
      }
    });

    // Cada busca recebe um número; respostas de buscas antigas são descartadas.
    let requisicaoAtual = 0;

    async function buscar(termo) {
      const minhaRequisicao = ++requisicaoAtual;

      estado.termoBusca = termo;
      estado.erro = null;
      estado.carregando = true;

      try {
        const resultado = await Solaris.plantasModel.obterPlantas(termo, 0);
        if (minhaRequisicao !== requisicaoAtual) {
          return;
        }
        estado.pagina = 0;
        estado.temMais = resultado.temMais;
        estado.plantas = resultado.plantas;
      } catch (erro) {
        if (minhaRequisicao !== requisicaoAtual) {
          return;
        }
        console.warn('Falha ao buscar o catálogo.', erro);
        estado.plantas = [];
        estado.temMais = false;
        estado.erro = MENSAGEM_FALHA;
      } finally {
        if (minhaRequisicao === requisicaoAtual) {
          estado.carregando = false;
        }
      }
    }

    async function carregarMais() {
      if (estado.carregando || !estado.temMais) {
        return;
      }

      const minhaRequisicao = ++requisicaoAtual;
      estado.carregando = true;

      try {
        const resultado = await Solaris.plantasModel.obterPlantas(estado.termoBusca, estado.pagina + 1);
        if (minhaRequisicao !== requisicaoAtual) {
          return;
        }
        estado.pagina = estado.pagina + 1;
        estado.temMais = resultado.temMais;
        estado.plantas = estado.plantas.concat(resultado.plantas);
      } catch (erro) {
        console.warn('Falha ao carregar mais plantas.', erro);
      } finally {
        if (minhaRequisicao === requisicaoAtual) {
          estado.carregando = false;
        }
      }
    }

    return { estado: estado, buscar: buscar, carregarMais: carregarMais };
  }

  Solaris.makeCatalogoViewModel = makeCatalogoViewModel;
})(window.Solaris);