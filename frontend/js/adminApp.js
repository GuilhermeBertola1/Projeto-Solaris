/**
 * View da área administrativa (admin.html).
 */
(function (Solaris) {
  'use strict';

  const esc = Solaris.utils.escaparHTML;
  const FORMATO_DATA_HORA = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

  const aviso = document.getElementById('aviso-admin');
  const form = document.getElementById('form-especie');
  const tituloForm = document.getElementById('titulo-form-especie');
  const botaoSalvar = form.querySelector('button[type="submit"]');
  const botaoCancelar = document.getElementById('btn-cancelar-edicao');
  const corpoEspecies = document.getElementById('corpo-especies');
  const corpoUsuarios = document.getElementById('corpo-usuarios');
  const paginacaoEspecies = document.getElementById('paginacao-especies');
  const paginacaoUsuarios = document.getElementById('paginacao-usuarios');

  let viewModel = null;
  let opcoesPreenchidas = false;
  let idNoFormulario = null;

  /* ---------- Aviso geral ---------- */

  function mostrarAviso(texto) {
    aviso.textContent = texto;
    aviso.hidden = !texto;
  }

  function tratarErro(erro) {
    if (erro && erro.status === 401) {
      Solaris.sessao.irParaLogin();
      return;
    }
    mostrarAviso(erro && erro.message ? erro.message : 'Não foi possível completar a operação.');
  }

  /* ---------- Formulário ---------- */

  function preencherSelect(select, opcoes, textoVazio) {
    select.replaceChildren();
    if (textoVazio !== undefined) {
      select.append(new Option(textoVazio, ''));
    }
    opcoes.forEach(function (opcao) {
      select.append(new Option(opcao.rotulo, String(opcao.id)));
    });
  }

  function preencherOpcoes(opcoes) {
    preencherSelect(form.elements.categoriaId, opcoes.categorias);
    preencherSelect(form.elements.nivelLuzId, opcoes.niveisLuz, 'Não informada');
    preencherSelect(form.elements.regimeRegaId, opcoes.regimesRega);

    const rotulos = Solaris.plantasModel.ROTULOS_DIFICULDADE;
    preencherSelect(form.elements.dificuldade, Object.keys(rotulos).map(function (codigo) {
      return { id: codigo, rotulo: rotulos[codigo] };
    }));
  }

  function renderizarFormulario(emEdicao) {
    const idAtual = emEdicao ? emEdicao.id : null;
    if (idAtual === idNoFormulario) {
      return;
    }
    idNoFormulario = idAtual;

    Solaris.formulario.limparErros(form);
    tituloForm.textContent = emEdicao ? 'Editar espécie: ' + emEdicao.nomePopular : 'Cadastrar espécie';
    botaoCancelar.hidden = !emEdicao;

    if (!emEdicao) {
      form.reset();
      return;
    }

    const campos = form.elements;
    campos.nomePopular.value = emEdicao.nomePopular;
    campos.nomeCientifico.value = emEdicao.nomeCientifico;
    campos.categoriaId.value = String(emEdicao.categoriaId);
    campos.nivelLuzId.value = emEdicao.nivelLuzId === null ? '' : String(emEdicao.nivelLuzId);
    campos.regimeRegaId.value = String(emEdicao.regimeRegaId);
    campos.dificuldade.value = emEdicao.dificuldade;
    campos.fotoUrl.value = emEdicao.fotoUrl || '';

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    campos.nomePopular.focus();
  }

  function lerFormulario() {
    const campos = form.elements;
    return {
      nomePopular: campos.nomePopular.value,
      nomeCientifico: campos.nomeCientifico.value,
      categoriaId: Number(campos.categoriaId.value),
      nivelLuzId: campos.nivelLuzId.value ? Number(campos.nivelLuzId.value) : null,
      regimeRegaId: Number(campos.regimeRegaId.value),
      dificuldade: campos.dificuldade.value,
      fotoUrl: campos.fotoUrl.value || null
    };
  }

  /* ---------- Tabelas ---------- */

  function nomeOculto(texto) {
    return '<span class="visualmente-oculto"> ' + esc(texto) + '</span>';
  }

  function linhaEspecie(e) {
    const id = Number(e.id);
    return '<tr>' +
      '<td>' + esc(e.nomePopular) + '</td>' +
      '<td><i>' + esc(e.nomeCientifico) + '</i></td>' +
      '<td>' + (e.ativo ? 'Ativa' : 'Desativada') + '</td>' +
      '<td class="acoes-tabela">' +
        '<button type="button" class="botao botao--secundario" data-acao="editar-especie" data-id="' + id + '">' +
          'Editar' + nomeOculto(e.nomePopular) + '</button>' +
        '<button type="button" class="botao ' + (e.ativo ? 'botao--perigo' : 'botao--secundario') + '" ' +
          'data-acao="alternar-especie" data-id="' + id + '" data-ativo="' + e.ativo + '">' +
          (e.ativo ? 'Desativar' : 'Reativar') + nomeOculto(e.nomePopular) + '</button>' +
      '</td>' +
    '</tr>';
  }

  function linhaUsuario(u) {
    const ultimoLogin = u.ultimoLoginEm ? FORMATO_DATA_HORA.format(new Date(u.ultimoLoginEm)) : 'Nunca';
    const acao = u.perfil === 'ADMIN'
      ? '—'
      : '<button type="button" class="botao ' + (u.ativo ? 'botao--perigo' : 'botao--secundario') + '" ' +
          'data-acao="alternar-usuario" data-id="' + Number(u.id) + '" data-ativo="' + u.ativo + '">' +
          (u.ativo ? 'Bloquear' : 'Desbloquear') + nomeOculto(u.nome) + '</button>';

    return '<tr>' +
      '<td>' + esc(u.nome) + '</td>' +
      '<td>' + esc(u.email) + '</td>' +
      '<td>' + esc(u.perfil) + '</td>' +
      '<td>' + (u.ativo ? 'Ativa' : 'Bloqueada') + '</td>' +
      '<td>' + esc(ultimoLogin) + '</td>' +
      '<td>' + acao + '</td>' +
    '</tr>';
  }

  function paginacao(dados, tipo) {
    if (dados.totalPaginas <= 1) {
      return '';
    }
    const anterior = dados.pagina - 1;
    const proxima = dados.pagina + 1;
    return '' +
      '<button type="button" class="botao botao--secundario" data-acao="pagina-' + tipo + '" ' +
        'data-pagina="' + anterior + '"' + (anterior < 0 ? ' disabled' : '') + '>Anterior</button>' +
      '<span>Página ' + proxima + ' de ' + dados.totalPaginas + '</span>' +
      '<button type="button" class="botao botao--secundario" data-acao="pagina-' + tipo + '" ' +
        'data-pagina="' + proxima + '"' + (proxima >= dados.totalPaginas ? ' disabled' : '') + '>Próxima</button>';
  }

  /* ---------- Render ---------- */

  function renderizar(estado) {
    if (estado.opcoes && !opcoesPreenchidas) {
      preencherOpcoes(estado.opcoes);
      opcoesPreenchidas = true;
    }

    renderizarFormulario(estado.emEdicao);

    corpoEspecies.innerHTML = estado.especies.itens.map(linhaEspecie).join('');
    paginacaoEspecies.innerHTML = paginacao(estado.especies, 'especies');

    corpoUsuarios.innerHTML = estado.usuarios.itens.map(linhaUsuario).join('');
    paginacaoUsuarios.innerHTML = paginacao(estado.usuarios, 'usuarios');

    if (estado.aviso) {
      mostrarAviso(estado.aviso);
    }
  }

  /* ---------- Eventos ---------- */

  form.addEventListener('submit', async function (evento) {
    evento.preventDefault();
    Solaris.formulario.limparErros(form);
    botaoSalvar.disabled = true;

    try {
      await viewModel.salvarEspecie(lerFormulario());
    } catch (erro) {
      if (erro && erro.status === 401) {
        Solaris.sessao.irParaLogin();
        return;
      }
      Solaris.formulario.mostrarErros(form, erro);
    } finally {
      botaoSalvar.disabled = false;
    }
  });

  botaoCancelar.addEventListener('click', function () {
    viewModel.cancelarEdicao();
  });

  // Delegação: um listener cobre todos os botões das tabelas e da paginação.
  document.getElementById('conteudo-principal').addEventListener('click', async function (evento) {
    const botao = evento.target.closest('button[data-acao]');
    if (!botao || !viewModel) {
      return;
    }

    const id = Number(botao.dataset.id);
    const ativo = botao.dataset.ativo === 'true';
    botao.disabled = true;

    try {
      switch (botao.dataset.acao) {
        case 'editar-especie':
          await viewModel.editar(id);
          break;
        case 'alternar-especie':
          await viewModel.alternarEspecie(id, ativo);
          break;
        case 'alternar-usuario':
          await viewModel.alternarUsuario(id, ativo);
          break;
        case 'pagina-especies':
          await viewModel.carregarEspecies(Number(botao.dataset.pagina));
          break;
        case 'pagina-usuarios':
          await viewModel.carregarUsuarios(Number(botao.dataset.pagina));
          break;
      }
    } catch (erro) {
      tratarErro(erro);
    } finally {
      botao.disabled = false;
    }
  });

  /* ---------- Início ---------- */

  Solaris.sessao.pronta.then(function (usuario) {
    if (!usuario) {
      return;
    }
    if (usuario.perfil !== 'ADMIN') {
      window.location.href = 'index.html';
      return;
    }
    viewModel = Solaris.makeAdminViewModel(renderizar);
    viewModel.iniciar().catch(tratarErro);
  });
})(window.Solaris);