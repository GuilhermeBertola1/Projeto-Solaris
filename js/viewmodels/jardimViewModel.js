window.Solaris = window.Solaris || {};

(function (Solaris) {
  'use strict';

  function criarEstadoReativo(estadoBase, onStateChange) {
    const estado = new Proxy(estadoBase, {
      set: function (alvo, propriedade, valor) {
        alvo[propriedade] = valor;
        onStateChange(estado);
        return true;
      }
    });
    return estado;
  }

  function comEstadoCalculado(planta) {
    return Object.assign({}, planta, Solaris.simulacaoModel.calcularEstadoPlanta(planta));
  }

  function makeJardimViewModel(onStateChange) {
    const estado = criarEstadoReativo({ plantas: [] }, onStateChange);

    function carregar() {
      estado.plantas = Solaris.jardimModel.obterJardim().map(comEstadoCalculado);
    }

    function regar(instanceId) {
      Solaris.jardimModel.regarPlanta(instanceId);
      carregar();
    }

    carregar();

    return { estado: estado, carregar: carregar, regar: regar };
  }

  function makePerfilViewModel(instanceId, onStateChange) {
    const estado = criarEstadoReativo({ planta: null, encontrada: true }, onStateChange);

    function carregar() {
      const planta = Solaris.jardimModel.obterPlantaDoJardim(instanceId);

      if (!planta) {
        estado.encontrada = false;
        return;
      }

      estado.planta = comEstadoCalculado(planta);
    }

    function regar() {
      Solaris.jardimModel.regarPlanta(instanceId);
      carregar();
    }

    carregar();

    return { estado: estado, regar: regar };
  }

  Solaris.makeJardimViewModel = makeJardimViewModel;
  Solaris.makePerfilViewModel = makePerfilViewModel;
})(window.Solaris);
