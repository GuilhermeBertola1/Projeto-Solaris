import { makeJardimViewModel } from './viewmodels/jardimViewModel.js';
import { HUMOR_INFO } from './models/simulacaoModel.js';

const containerAtencao = document.getElementById('container-atencao');
const containerTodas = document.getElementById('container-todas');

function cardPlantaHTML(planta) {
  const humor = HUMOR_INFO[planta.humor];

  return `
    <article class="card-planta">
      <figure>
        <img src="${planta.foto}" alt="${planta.nome}" width="250" height="200" loading="lazy">
        <figcaption>${planta.especie}</figcaption>
      </figure>
      <h3>${planta.nome}</h3>
      <p class="planta-humor">
        <img class="humor-sprite" src="${humor.sprite}" alt="" width="40" height="40" loading="lazy">
        <span>${humor.label}</span>
      </p>
      <a href="perfil.html?id=${encodeURIComponent(planta.instanceId)}">Ver detalhes</a>
    </article>
  `;
}

function renderizarJardim(estado) {
  const precisamAtencao = estado.plantas.filter(p => p.humor !== 'feliz');

  containerAtencao.innerHTML = precisamAtencao.length
    ? precisamAtencao.map(cardPlantaHTML).join('')
    : `<p class="mensagem-status">Nenhuma planta precisando de atenção agora. 🌱</p>`;

  containerTodas.innerHTML = estado.plantas.length
    ? estado.plantas.map(cardPlantaHTML).join('')
    : `<p class="mensagem-status">Seu jardim está vazio. <a href="catalogo.html">Busque plantas no catálogo</a> e adicione a primeira.</p>`;
}
