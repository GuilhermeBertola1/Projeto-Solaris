window.Solaris = window.Solaris || {};

(function (Solaris) {
  'use strict';

  const MS_POR_DIA = 1000 * 60 * 60 * 24;

  const DIAS_FIM_BROTACAO = 15;
  const DIAS_FIM_VEGETATIVO = 30;

  const DIAS_ATE_ATENCAO = 1.5;
  const DIAS_ATE_SEDE = 3;

  function calcularEstadoPlanta(planta) {
    const agora = Date.now();
    const diasDePlantada = Math.max(0, Math.floor((agora - planta.dataAdicionada) / MS_POR_DIA));
    const diasSemRegar = Math.max(0, (agora - planta.ultimaRega) / MS_POR_DIA);

    let fase;
    if (diasDePlantada < DIAS_FIM_BROTACAO) {
      fase = 'brotacao';
    } else if (diasDePlantada < DIAS_FIM_VEGETATIVO) {
      fase = 'vegetativo';
    } else {
      fase = 'adulta';
    }

    let humor;
    if (diasSemRegar > DIAS_ATE_SEDE) {
      humor = 'sedenta';
    } else if (diasSemRegar > DIAS_ATE_ATENCAO) {
      humor = 'atencao';
    } else {
      humor = 'feliz';
    }

    return {
      diasDePlantada: diasDePlantada,
      diasSemRegar: diasSemRegar,
      fase: fase,
      humor: humor
    };
  }

  const ORDEM_FASES = ['brotacao', 'vegetativo', 'adulta'];

  const FASES_INFO = {
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

  const HUMOR_INFO = {
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

  Solaris.simulacaoModel = {
    calcularEstadoPlanta: calcularEstadoPlanta,
    ORDEM_FASES: ORDEM_FASES,
    FASES_INFO: FASES_INFO,
    HUMOR_INFO: HUMOR_INFO
  };
})(window.Solaris);
