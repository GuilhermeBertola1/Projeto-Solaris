const CHAVE_ARMAZENAMENTO = 'solaris_meuJardim';

function gerarInstanceId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `planta-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function salvarJardim(jardim) {
  localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(jardim));
}

export function obterJardim() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_ARMAZENAMENTO));
    return Array.isArray(dados) ? dados : [];
  } catch (erro) {
    console.warn('Dados do jardim corrompidos no localStorage. Reiniciando.', erro);
    return [];
  }
}

export function adicionarAoJardim(planta) {
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

export function obterPlantaDoJardim(instanceId) {
  return obterJardim().find(p => p.instanceId === instanceId) || null;
}

export function regarPlanta(instanceId) {
  const jardim = obterJardim().map(p =>
    p.instanceId === instanceId ? { ...p, ultimaRega: Date.now() } : p
  );
  salvarJardim(jardim);
  return obterPlantaDoJardim(instanceId);
}

export function removerDoJardim(instanceId) {
  const jardim = obterJardim().filter(p => p.instanceId !== instanceId);
  salvarJardim(jardim);
}
