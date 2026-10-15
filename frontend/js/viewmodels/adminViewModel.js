window.Solaris = window.Solaris || {};

(function (Solaris) {
  'use strict';

  const PAGINA_VAZIA = { itens: [], pagina: 0, totalPaginas: 0 };

  function makeAdminViewModel(onStateChange) {
    const modelo = Solaris.adminModel;

    const estado = new Proxy({
      opcoes: null,
      especies: PAGINA_VAZIA,
      usuarios: PAGINA_VAZIA,
      emEdicao: null,
      aviso: ''
    }, {
      set: function (alvo, propriedade, valor) {
        alvo[propriedade] = valor;
        onStateChange(alvo);
        return true;
      }
    });

    async function carregarEspecies(pagina) {
      estado.especies = await modelo.listarEspecies(pagina);
    }

    async function carregarUsuarios(pagina) {
      estado.usuarios = await modelo.listarUsuarios(pagina);
    }

    async function iniciar() {
      const resultados = await Promise.all([
        modelo.opcoesDeEspecie(),
        carregarEspecies(0),
        carregarUsuarios(0)
      ]);
      estado.opcoes = resultados[0];
    }

    async function editar(id) {
      estado.emEdicao = await modelo.buscarEspecie(id);
    }

    function cancelarEdicao() {
      estado.emEdicao = null;
    }

    async function salvarEspecie(dados) {
      const salva = estado.emEdicao
        ? await modelo.atualizarEspecie(estado.emEdicao.id, dados)
        : await modelo.criarEspecie(dados);

      estado.emEdicao = null;
      estado.aviso = 'Espécie "' + salva.nomePopular + '" salva.';
      await carregarEspecies(estado.especies.pagina);
    }

    async function alternarEspecie(id, ativoAtual) {
      const especie = await modelo.definirAtivoEspecie(id, !ativoAtual);
      estado.aviso = 'Espécie "' + especie.nomePopular + '" ' +
        (especie.ativo ? 'reativada.' : 'desativada.');
      await carregarEspecies(estado.especies.pagina);
    }

    async function alternarUsuario(id, ativoAtual) {
      const usuario = await modelo.definirAtivoUsuario(id, !ativoAtual);
      estado.aviso = 'Conta de ' + usuario.nome + ' ' +
        (usuario.ativo ? 'desbloqueada.' : 'bloqueada.');
      await carregarUsuarios(estado.usuarios.pagina);
    }

    return {
      estado: estado,
      iniciar: iniciar,
      carregarEspecies: carregarEspecies,
      carregarUsuarios: carregarUsuarios,
      editar: editar,
      cancelarEdicao: cancelarEdicao,
      salvarEspecie: salvarEspecie,
      alternarEspecie: alternarEspecie,
      alternarUsuario: alternarUsuario
    };
  }

  Solaris.makeAdminViewModel = makeAdminViewModel;
})(window.Solaris);