import { makeViewModel } from './viewmodels/catalogoViewModel.js';

const inputBusca = document.getElementById('busca');
const formBusca = document.getElementById('form-busca');
const containerResultados = document.getElementById('container-resultados');

function rednView(estado){
  if(estado.carregando){
    containerResultados.innerHTML = `<p class="mensagem-status">Carregando plantas...</p>`;
    return;
  }

  if (estado.plantas.length === 0) {
    containerResultados.innerHTML = `<p class="mensagem-status">Nenhuma planta encontrada para "${estado.termoBusca}".</p>`;
    return;
  }
  
  containerResultados.innerHTML = estado.plantas.map(planta => `
    <article class="card-planta">
      <figure>
        <img src="${planta.foto}" alt="${planta.nome}" width="250" height="200" loading="lazy">
        <figcaption>${planta.especie}</figcaption>
      </figure>
      <h3>${planta.nome}</h3>
      <p>Luz: ${planta.luz} | Rega: ${planta.dificuldade}</p>
      <button type="button">Adicionar ao Jardim</button>
    </article>
  `).join('');
};

const viewModel = makeViewModel(rednView);

inputBusca.addEventListener('input', (e) => {
  viewModel.buscar(e.target.value);
});

formBusca.addEventListener('submit', (e) => {
  e.preventDefault();
  viewModel.buscar(inputBusca.value);
});

viewModel.buscar('');
