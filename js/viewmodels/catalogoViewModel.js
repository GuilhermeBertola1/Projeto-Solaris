import {obterPlantas} from '../models/plantasModel.js';

export function makeViewModel(onStateChange) {
  const estadoBase = {
    termoBusca: '',
    plantas: [],
    carregando: false
  };

  const estado = new Proxy(estadoBase, {
    set(alvo, propriedade, valor) {
      alvo[propriedade] = valor;
      onStateChange(estado);
      return true;
    }
  });

  return {
    estado,

    async buscar(termo) {
      estado.carregando = true;
      estado.termoBusca = termo;

      const resultados = await obterPlantas(termo);

      estado.plantas = resultados;
      estado.carregando = false;
    }
  };
}

