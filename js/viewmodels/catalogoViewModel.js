import {obterPlantas} from '../models/plantasModel.js';

export function makeViewModel(onStateChange){
  const estate = {
    termoBusca: '',
    plantas: [],
    carregando: false
  }

  const stateAct = new Proxy(estate, {
    set(target, propriedades, valor) {
      target[propriedades] = valor;
      onStateChange(stateAct);
      return true;
    }
  });

  return{
    estado: stateAct,
    
    async buscar(termo){
      stateAct.carregando = true;
      stateAct.termoBusca = termo;

      const resultados = await obterPlantas(termo);

      stateAct.plantas = resultados;
      stateAct.carregando = false;
    }
  };
}
