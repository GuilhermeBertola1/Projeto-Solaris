window.Solaris = window.Solaris || {};

(function (Solaris) {
  'use strict';

  const TAMANHO_PAGINA = 20;
  const api = Solaris.api;

  function listarEspecies(pagina) {
    return api.get('/api/admin/especies?pagina=' + pagina + '&tamanho=' + TAMANHO_PAGINA);
  }

  function buscarEspecie(id) {
    return api.get('/api/admin/especies/' + encodeURIComponent(id));
  }

  function opcoesDeEspecie() {
    return api.get('/api/admin/especies/opcoes');
  }

  function criarEspecie(dados) {
    return api.post('/api/admin/especies', dados);
  }

  function atualizarEspecie(id, dados) {
    return api.put('/api/admin/especies/' + encodeURIComponent(id), dados);
  }

  function definirAtivoEspecie(id, ativo) {
    return api.patch('/api/admin/especies/' + encodeURIComponent(id) + '/ativo', { ativo: ativo });
  }

  function listarUsuarios(pagina) {
    return api.get('/api/admin/usuarios?pagina=' + pagina + '&tamanho=' + TAMANHO_PAGINA);
  }

  function definirAtivoUsuario(id, ativo) {
    return api.patch('/api/admin/usuarios/' + encodeURIComponent(id) + '/ativo', { ativo: ativo });
  }

  Solaris.adminModel = {
    listarEspecies: listarEspecies,
    buscarEspecie: buscarEspecie,
    opcoesDeEspecie: opcoesDeEspecie,
    criarEspecie: criarEspecie,
    atualizarEspecie: atualizarEspecie,
    definirAtivoEspecie: definirAtivoEspecie,
    listarUsuarios: listarUsuarios,
    definirAtivoUsuario: definirAtivoUsuario
  };
})(window.Solaris);