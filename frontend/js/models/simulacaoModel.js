window.Solaris = window.Solaris || {};

(function (Solaris) {
  'use strict';

  const MS_POR_DIA = 1000 * 60 * 60 * 24;

  const DIAS_FIM_BROTACAO = 15;
  const DIAS_FIM_VEGETATIVO = 30;

  const ORDEM_FASES = ['brotacao', 'vegetativo', 'adulta'];

  const LIMITES_FASE = {
    brotacao:   { inicio: 0, fim: DIAS_FIM_BROTACAO, rotulo: 'Brotação' },
    vegetativo: { inicio: DIAS_FIM_BROTACAO, fim: DIAS_FIM_VEGETATIVO, rotulo: 'Crescimento Vegetativo' },
    adulta:     { inicio: DIAS_FIM_VEGETATIVO, fim: null, rotulo: 'Fase Adulta' }
  };

  const INTERVALOS_REGA = {
    frequente: { dias: 2, texto: 'quase todo dia' },
    media:     { dias: 4, texto: 'a cada três ou quatro dias' },
    espacada:  { dias: 10, texto: 'só quando o substrato secar por completo' }
  };

  function regimeDeRega(planta) {
    const categoria = normalizarCategoria(planta);
    if (categoria === 'suculenta') {
      return INTERVALOS_REGA.espacada;
    }

    const bruto = String(planta.dificuldade || '').toLowerCase();

    if (bruto.includes('frequent') || bruto.includes('difícil') || bruto.includes('dificil')) {
      return INTERVALOS_REGA.frequente;
    }
    if (bruto.includes('minimum') || bruto.includes('muito fácil') || bruto.includes('muito facil')) {
      return INTERVALOS_REGA.espacada;
    }
    return INTERVALOS_REGA.media;
  }

  /* ---------------------------------------------------------------
     Luz: frase de orientação a partir do campo `luz`
     --------------------------------------------------------------- */

  /**
   * @param {Object} planta
   * @returns {string} orientação de posicionamento, já em português
   */
  function orientacaoDeLuz(planta) {
    const bruto = String(planta.luz || '').toLowerCase();

    if (bruto.includes('sol pleno') || bruto.includes('full sun')) {
      return 'Ela pede sol pleno: deixe em um ponto com pelo menos seis horas de sol direto.';
    }
    if (bruto.includes('meia-sombra') || bruto.includes('part shade') || bruto.includes('part sun')) {
      return 'Ela prefere meia-sombra: sol da manhã sim, sol forte da tarde não.';
    }
    if (bruto.includes('indireta') || bruto.includes('filtered') || bruto.includes('shade')) {
      return 'Ela vive bem com luz indireta: perto de uma janela, mas fora do sol direto.';
    }
    return 'Observe como ela reage à luz do seu ambiente e ajuste a posição do vaso aos poucos.';
  }

  const CATEGORIAS = {
    horta: {
      rotulo: 'Horta e ervas',
      brotacao: 'Mantenha o substrato levemente úmido e a semeadura rasa — sementes de horta germinam mal se enterradas fundo.',
      vegetativo: 'É agora que a folhagem se forma. Adube a cada 20 dias com NPK 10-10-10 e retire as folhas de baixo que amarelarem.',
      adulta: 'Colha as folhas externas primeiro e nunca mais de um terço da planta por vez: assim ela continua produzindo.'
    },
    interior: {
      rotulo: 'Planta de interior',
      brotacao: 'Raízes novas em ambiente interno apodrecem com facilidade. Molhe pouco e confira se o vaso drena de verdade.',
      vegetativo: 'Adube de forma diluída a cada 30 dias, só na primavera e no verão. Limpe o pó das folhas para ela respirar.',
      adulta: 'Replante a cada dois anos, quando as raízes aparecerem no furo do vaso. Gire o vaso toda semana para o crescimento não pender.'
    },
    suculenta: {
      rotulo: 'Suculenta ou cacto',
      brotacao: 'Substrato arenoso e rega bem espaçada. O erro mais comum com suculenta jovem é o excesso de água, não a falta.',
      vegetativo: 'Adube no máximo uma vez na estação, com fertilizante de baixa concentração. Excesso de nitrogênio deixa a planta mole e estiolada.',
      adulta: 'Folhas murchas e enrugadas pedem água; folhas translúcidas e moles indicam água demais. Na dúvida, espere mais um dia.'
    },
    flor: {
      rotulo: 'Flor ornamental',
      brotacao: 'Evite molhar as folhas na rega para não favorecer fungos. Água na base, sempre.',
      vegetativo: 'Troque para um adubo mais rico em fósforo (tipo NPK 04-14-08) — é ele que prepara a floração.',
      adulta: 'Remova as flores murchas assim que passarem do ponto. Isso redireciona a energia da planta para novos botões.'
    },
    frutifera: {
      rotulo: 'Frutífera em vaso',
      brotacao: 'Escolha desde já um vaso fundo: frutífera em vaso raso trava o crescimento antes de dar o primeiro fruto.',
      vegetativo: 'Adube a cada 30 dias com NPK 10-10-10 e faça a poda de formação, deixando três ou quatro ramos principais.',
      adulta: 'Na frutificação a demanda por água e potássio sobe. Se aparecerem muitos frutos pequenos, faça o raleio e fique com os melhores.'
    },
    geral: {
      rotulo: 'Planta',
      brotacao: 'Mantenha a terra levemente úmida enquanto as primeiras raízes se fixam no substrato.',
      vegetativo: 'Acompanhe o crescimento das folhas e adube de forma equilibrada uma vez por mês.',
      adulta: 'A planta atingiu maturidade. Mantenha a rotina de cuidados e observe sinais de floração ou frutificação.'
    }
  };

  function normalizarCategoria(planta) {
    if (planta.categoria && CATEGORIAS[planta.categoria]) {
      return planta.categoria;
    }

    const rega = String(planta.dificuldade || '').toLowerCase();
    const luz = String(planta.luz || '').toLowerCase();

    if (rega.includes('minimum') && (luz.includes('full sun') || luz.includes('sol pleno'))) {
      return 'suculenta';
    }
    if (luz.includes('shade') || luz.includes('indireta')) {
      return 'interior';
    }
    return 'geral';
  }

  function descreverFase(chaveFase, planta) {
    const limites = LIMITES_FASE[chaveFase];
    const base = CATEGORIAS[normalizarCategoria(planta)][chaveFase];

    let complemento;
    if (chaveFase === 'brotacao') {
      complemento = 'Regue ' + regimeDeRega(planta).texto + '.';
    } else if (chaveFase === 'vegetativo') {
      complemento = orientacaoDeLuz(planta);
    } else {
      complemento = 'Mantenha a rega ' + regimeDeRega(planta).texto + ' e acompanhe a planta ao longo das estações.';
    }

    const intervalo = limites.fim
      ? 'Dia ' + (limites.inicio + 1) + ' a ' + limites.fim
      : 'Dia ' + (limites.inicio + 1) + ' em diante';

    return {
      titulo: limites.rotulo + ' (' + intervalo + ')',
      descricao: base + ' ' + complemento
    };
  }

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

  function calcularEstadoPlanta(planta) {
    const agora = Date.now();
    const diasDePlantada = Math.max(0, Math.floor((agora - planta.dataAdicionada) / MS_POR_DIA));
    const diasSemRegar = Math.max(0, (agora - planta.ultimaRega) / MS_POR_DIA);

    const regime = regimeDeRega(planta);
    const diasAteProximaRega = Math.ceil(regime.dias - diasSemRegar);

    let fase;
    if (diasDePlantada < DIAS_FIM_BROTACAO) {
      fase = 'brotacao';
    } else if (diasDePlantada < DIAS_FIM_VEGETATIVO) {
      fase = 'vegetativo';
    } else {
      fase = 'adulta';
    }

    let humor;
    if (diasSemRegar > regime.dias) {
      humor = 'sedenta';
    } else if (diasSemRegar > regime.dias / 2) {
      humor = 'atencao';
    } else {
      humor = 'feliz';
    }

    return {
      diasDePlantada: diasDePlantada,
      diasSemRegar: diasSemRegar,
      fase: fase,
      humor: humor,
      categoria: normalizarCategoria(planta),
      rotuloCategoria: CATEGORIAS[normalizarCategoria(planta)].rotulo,
      intervaloRega: regime.dias,
      textoRega: regime.texto,
      diasAteProximaRega: diasAteProximaRega,
      progresso: calcularProgresso(fase, diasDePlantada)
    };
  }

  function calcularProgresso(fase, diasDePlantada) {
    const limites = LIMITES_FASE[fase];
    const diaNaFase = diasDePlantada - limites.inicio;

    if (limites.fim === null) {
      return { diaNaFase: diaNaFase, totalDaFase: null, percentual: 100 };
    }

    const totalDaFase = limites.fim - limites.inicio;
    const percentual = Math.min(100, Math.round((diaNaFase / totalDaFase) * 100));

    return { diaNaFase: diaNaFase, totalDaFase: totalDaFase, percentual: percentual };
  }

  function descreverProximaRega(estado) {
    const dias = estado.diasAteProximaRega;

    if (dias < 0) {
      const atraso = Math.abs(dias);
      return {
        texto: 'Rega atrasada há ' + atraso + (atraso === 1 ? ' dia' : ' dias'),
        atrasada: true
      };
    }
    if (dias === 0) {
      return { texto: 'Regue hoje', atrasada: true };
    }
    if (dias === 1) {
      return { texto: 'Regue amanhã', atrasada: false };
    }
    return { texto: 'Próxima rega em ' + dias + ' dias', atrasada: false };
  }

  Solaris.simulacaoModel = {
    calcularEstadoPlanta: calcularEstadoPlanta,
    descreverFase: descreverFase,
    descreverProximaRega: descreverProximaRega,
    ORDEM_FASES: ORDEM_FASES,
    LIMITES_FASE: LIMITES_FASE,
    CATEGORIAS: CATEGORIAS,
    HUMOR_INFO: HUMOR_INFO
  };
})(window.Solaris);
