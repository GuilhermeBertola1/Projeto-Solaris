const CHAVE_ARMAZENAMENTO = 'solaris_meuJardim';

function gerarIntanceId(){
    if (window.crypto && typeof window.crypto.randomUUID === 'function'){
        return window.crypto.randomUUID();
    }
    return `planta-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function salvarJardim(jardim){
    localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(jardim));
}

export function obterJardim(){
    try{
        const dados = JSON.parse(localStorage.getItem(CHAVE_ARMAZENAMENTO));
        return Array.isArray(dados)?dados:[];
    }catch(erro){
        console.warn('Dados jardim corompido', erro);
        return [];
    }
}