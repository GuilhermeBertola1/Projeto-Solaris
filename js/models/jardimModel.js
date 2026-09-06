window.Solaris = window.Solaris || {};

(function (Solaris) {
  'use strict';

  const CHAVE_ARMAZENAMENTO = 'solaris_meuJardim';

  function gerarInstanceId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return 'planta-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }

  function salvarJardim(jardim) {
    try {
      localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(jardim));
    } catch (erro) {
      console.warn('Não foi possível salvar o jardim no localStorage.', erro);
    }
  }

  function obterJardim() {
    try {
      const dados = JSON.parse(localStorage.getItem(CHAVE_ARMAZENAMENTO));
      return Array.isArray(dados) ? dados : [];
    } catch (erro) {
      console.warn('Dados do jardim corrompidos no localStorage. Reiniciando.', erro);
      return [];
    }
  }

  function adicionarAoJardim(planta) {
    const jardim = obterJardim();
    const agora = Date.now();

    const novaEntrada = {
      instanceId: gerarInstanceId(),
      nome: planta.nome,
      especie: planta.especie,
      luz: planta.luz,
      dificuldade: planta.dificuldade,
      foto: planta.foto,
      dataAdicionada: agora,
      ultimaRega: agora
    };

    jardim.push(novaEntrada);
    salvarJardim(jardim);
    return novaEntrada;
  }

  function obterPlantaDoJardim(instanceId) {
    const encontrada = obterJardim().find(function (planta) {
      return planta.instanceId === instanceId;
    });
    return encontrada || null;
  }

  function regarPlanta(instanceId) {
    const jardim = obterJardim().map(function (planta) {
      if (planta.instanceId !== instanceId) {
        return planta;
      }
      return Object.assign({}, planta, { ultimaRega: Date.now() });
    });

    salvarJardim(jardim);
    return obterPlantaDoJardim(instanceId);
  }

  function removerDoJardim(instanceId) {
    const jardim = obterJardim().filter(function (planta) {
      return planta.instanceId !== instanceId;
    });
    salvarJardim(jardim);
  }

  Solaris.jardimModel = {
    obterJardim: obterJardim,
    adicionarAoJardim: adicionarAoJardim,
    obterPlantaDoJardim: obterPlantaDoJardim,
    regarPlanta: regarPlanta,
    removerDoJardim: removerDoJardim
  };
})(window.Solaris);
