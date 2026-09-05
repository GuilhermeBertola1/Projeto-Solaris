const MS_POR_DIA = 1000*60*60*24;

export function calcularEstadoPlanta(planta){
    const diasDePlantada = Math.max(0, Math.floor((Date.now() - planta.dataAdicionada)/MS_POR_DIA));
    const diasSemRegar = Math.max(0, (Date.now() - planta.ultimaRega)/MS_POR_DIA);

    let fase;
    if(diasDePlantada < 15){
        fase = 'brotacao';
    }else if(diasDePlantada < 30){
        fase = 'vegetativo';
    }else{
        fase = 'adulta';
    }

    let humor;
    if (diasSemRegar > 3) {
        humor = 'sedenta';
    } else if (diasSemRegar > 1.5) {
        humor = 'atencao';
    } else {
        humor = 'feliz';
    }

    return { diasDePlantada, diasSemRegar, fase, humor };
};

export const FASES_INFO = {
  brotacao: {
    titulo: 'Fase 1: Brotação (Dia 1 a 15)',
    descricao: 'Mantenha a terra levemente úmida. As primeiras raízes estão se fixando no substrato.'
  },
  vegetativo: {
    titulo: 'Fase 2: Crescimento Vegetativo (Dia 16 a 30)',
    descricao: 'O ideal é adubar a cada 30 dias com NPK 10-10-10 e observar o crescimento das folhas.'
  },
  adulta: {
    titulo: 'Fase 3: Fase Adulta (Dia 31 em diante)',
    descricao: 'A planta atingiu maturidade. Mantenha a rotina de rega e observe sinais de floração ou frutificação.'
  }
};

export const HUMOR_INFO = {
  feliz: {
    sprite: 'assets/images/planta-feliz.svg',
    label: 'Feliz e hidratada'
  },
  atencao: {
    sprite: 'assets/images/planta-atencao.svg',
    label: 'Começando a sentir sede'
  },
  sedenta: {
    sprite: 'assets/images/planta-sedenta.svg',
    label: 'Precisando de água urgente'
  }
};