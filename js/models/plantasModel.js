import {PLANTAS_LOCAL_DATA} from './dados_locais.js';

export async function obterPlantas(termo = ''){
  const API_KEY = 'sk-CsNR6a805dcfa54f519383';
  const API_URL = `https://perenual.com/api/species-list?key=${API_KEY}&q=${encodeURIComponent(termo)}`

  try{
    const resposta = await fetch(API_URL);
    if(!resposta.ok) throw new Error("Conexao API error");

    const resultado = await resposta.json();
    

    return resultado.data.map(item => ({
      id: item.id,
      nome: item.common_name || "Planta Desconhecida",
      especie: item.scientific_name ? item.scientific_name[0] : "Sem nome científico",
      luz: Array.isArray(item.sunlight) ? item.sunlight.join(', ') : (item.sunlight || "Não informada"),
      dificuldade: item.watering || "Média",
      foto: item.default_image ? item.default_image.thumbnail : "assets/images/tomate-cereja.jpg"
    }));
  }catch (erro){
    console.warn("API indisponível. Utilizando banco de dados local:", erro);
    
    return PLANTAS_LOCAL_DATA.filter(p =>
      p.nome.toLowerCase().includes(termo.toLowerCase()) ||
      p.especie.toLowerCase().includes(termo.toLowerCase())
    );
  }
}
