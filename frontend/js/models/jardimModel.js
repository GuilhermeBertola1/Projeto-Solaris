window.Solaris = window.Solaris || {};

(function (Solaris) {
  'use strict';

  const CHAVE_ARMAZENAMENTO = 'solaris_meuJardim';

  const TAMANHO_HISTORICO = 10;

  function gerarInstanceId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return 'planta-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }

  function salvarJardim(jardim) {
    try {
      localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(jardim));
      return true;
    } catch (erro) {
      console.warn('Não foi possível salvar o jardim no localStorage.', erro);
      return false;
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
      categoria: planta.categoria || null,
      foto: Solaris.imagemModel.normalizarFoto(planta.foto),
      dataAdicionada: agora,
      ultimaRega: agora,
      historicoRegas: [agora]
    };

    jardim.push(novaEntrada);
    salvarJardim(jardim);
    return novaEntrada;
  }

  function atualizarFoto(instanceId, foto) {
    if (!foto) {
      return null;
    }

    const jardim = obterJardim().map(function (planta) {
      if (planta.instanceId !== instanceId) {
        return planta;
      }
      return Object.assign({}, planta, { foto: foto });
    });

    if (!salvarJardim(jardim)) {
      return null;
    }
    return obterPlantaDoJardim(instanceId);
  }

  function obterPlantaDoJardim(instanceId) {
    const encontrada = obterJardim().find(function (planta) {
      return planta.instanceId === instanceId;
    });
    return encontrada || null;
  }

  function regarPlanta(instanceId) {
    const agora = Date.now();

    const jardim = obterJardim().map(function (planta) {
      if (planta.instanceId !== instanceId) {
        return planta;
      }

      const historico = (planta.historicoRegas || []).concat(agora);

      return Object.assign({}, planta, {
        ultimaRega: agora,
        historicoRegas: historico.slice(-TAMANHO_HISTORICO)
      });
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
    atualizarFoto: atualizarFoto,
    obterPlantaDoJardim: obterPlantaDoJardim,
    regarPlanta: regarPlanta,
    removerDoJardim: removerDoJardim
  };
})(window.Solaris);
