import { obterJardim, regarPlanta, obterPlantaDoJardim } from '../models/jardimModel.js';
import { calcularEstadoPlanta } from '../models/simulacaoModel.js';

export function makeJardimViewModel(onStateChange) {
  const estadoBase = { plantas: [] };

  const estado = new Proxy(estadoBase, {
    set(alvo, propriedade, valor) {
      alvo[propriedade] = valor;
      onStateChange(estado);
      return true;
    }
  });

  function carregar() {
    estado.plantas = obterJardim().map(planta => ({
      ...planta,
      ...calcularEstadoPlanta(planta)
    }));
  }

  function regar(instanceId) {
    regarPlanta(instanceId);
    carregar();
  }

  carregar();

  return { estado, carregar, regar };
}

export function makePerfilViewModel(instanceId, onStateChange) {
  const estadoBase = { planta: null, encontrada: true };

  const estado = new Proxy(estadoBase, {
    set(alvo, propriedade, valor) {
      alvo[propriedade] = valor;
      onStateChange(estado);
      return true;
    }
  });

  function carregar() {
    const planta = obterPlantaDoJardim(instanceId);

    if (!planta) {
      estado.encontrada = false;
      return;
    }

    estado.planta = { ...planta, ...calcularEstadoPlanta(planta) };
  }

  function regar() {
    regarPlanta(instanceId);
    carregar();
  }

  carregar();

  return { estado, regar };
}
