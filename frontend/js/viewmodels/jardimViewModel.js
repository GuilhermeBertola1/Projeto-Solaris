window.Solaris = window.Solaris || {};

(function (Solaris) {
  'use strict';

  function criarEstadoReativo(estadoBase, onStateChange) {
    return new Proxy(estadoBase, {
      set: function (alvo, propriedade, valor) {
        alvo[propriedade] = valor;
        onStateChange(alvo);
        return true;
      }
    });
  }

  // Sessão expirada no meio do uso: volta para o login.
  function tratarErro(erro, estado, mensagem) {
    if (erro && erro.status === 401) {
      Solaris.sessao.irParaLogin();
      return;
    }
    console.warn(mensagem, erro);
    estado.erro = mensagem;
  }

  function makeJardimViewModel(onStateChange) {
    const estado = criarEstadoReativo(
      { plantas: [], carregando: true, erro: null }, onStateChange);

    async function carregar() {
      try {
        estado.plantas = await Solaris.jardimModel.obterJardim();
      } catch (erro) {
        tratarErro(erro, estado, 'Não foi possível carregar o seu jardim.');
      } finally {
        estado.carregando = false;
      }
    }

    return { estado: estado, carregar: carregar };
  }

  function makePerfilViewModel(id, onStateChange) {
    const estado = criarEstadoReativo(
      { planta: null, encontrada: true, carregando: true, erro: null }, onStateChange);

    async function comHistorico(planta) {
      planta.historicoRegas = await Solaris.jardimModel.obterHistoricoDeRegas(id);
      return planta;
    }

    async function carregar() {
      try {
        const planta = await Solaris.jardimModel.obterPlantaDoJardim(id);
        if (!planta) {
          estado.encontrada = false;
          return;
        }
        estado.planta = await comHistorico(planta);
      } catch (erro) {
        tratarErro(erro, estado, 'Não foi possível carregar esta planta.');
      } finally {
        estado.carregando = false;
      }
    }

    async function regar() {
      const atualizada = await Solaris.jardimModel.regarPlanta(id);
      estado.planta = await comHistorico(atualizada);
    }

    function remover() {
      return Solaris.jardimModel.removerDoJardim(id);
    }

    return { estado: estado, carregar: carregar, regar: regar, remover: remover };
  }

  Solaris.makeJardimViewModel = makeJardimViewModel;
  Solaris.makePerfilViewModel = makePerfilViewModel;
})(window.Solaris);