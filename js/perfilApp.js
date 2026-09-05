import { makePerfilViewModel } from './viewmodels/jardimViewModel.js';
import { FASES_INFO, HUMOR_INFO } from './models/simulacaoModel.js';

const params = new URLSearchParams(window.location.search);
const instanceId = params.get('id');

const elTitulo = document.getElementById('titulo-planta');
const elConteudo = document.getElementById('conteudo-perfil');

const ORDEM_FASES = ['brotacao', 'vegetativo', 'adulta'];

function renderizar(estado) {
  if (!estado.encontrada) {
    elTitulo.textContent = 'Planta não encontrada';
    elConteudo.innerHTML = `
      <p class="mensagem-status">
        Não encontramos essa planta no seu jardim.
        <a href="index.html">Voltar para Meu Jardim</a>
      </p>`;
    return;
  }

  if (!estado.planta) return;

  const planta = estado.planta;
  const humor = HUMOR_INFO[planta.humor];

  elTitulo.textContent = `Perfil da planta: ${planta.nome}`;

  elConteudo.innerHTML = `
    <section class="secao-info-basica">
      <h2>Informações</h2>
      <figure>
        <img src="${planta.foto}" alt="${planta.nome}" width="400" height="300" loading="lazy">
        <figcaption>${planta.especie}</figcaption>
      </figure>
      <ul>
        <li><strong>Luz Ideal:</strong> ${planta.luz}</li>
        <li><strong>Dificuldade:</strong> ${planta.dificuldade}</li>
        <li><strong>No jardim há:</strong> ${planta.diasDePlantada} dia(s)</li>
      </ul>
    </section>

    <section class="secao-simulacao">
      <h2>Simulação de crescimento da planta</h2>

      <p class="planta-humor planta-humor--grande">
        <img class="humor-sprite humor-sprite--grande" src="${humor.sprite}" alt="" width="96" height="96" loading="lazy">
        <span>${humor.label}</span>
      </p>

      <button type="button" id="btn-regar">Reguei hoje</button>

      <ol>
        ${ORDEM_FASES.map(chave => {
          const info = FASES_INFO[chave];
          const atual = chave === planta.fase;
          return `
            <li class="${atual ? 'fase-atual' : ''}">
              <h3>${info.titulo}${atual ? ' — Você está aqui' : ''}</h3>
              <p>${info.descricao}</p>
            </li>`;
        }).join('')}
      </ol>
    </section>
  `;

  document.getElementById('btn-regar').addEventListener('click', () => {
    viewModel.regar();
  });
}

let viewModel = null;

if (!instanceId) {
  elTitulo.textContent = 'Planta não encontrada';
  elConteudo.innerHTML = `
    <p class="mensagem-status">
      Nenhuma planta foi informada na URL.
      <a href="index.html">Voltar para Meu Jardim</a>
    </p>`;
} else {
  viewModel = makePerfilViewModel(instanceId, renderizar);
}