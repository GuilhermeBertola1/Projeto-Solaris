window.Solaris = window.Solaris || {};

(function (Solaris) {
  'use strict';

  const URL_PLACEHOLDER = 'assets/images/placeholder.jpg';

  const LARGURA = 300;
  const ALTURA = 225;
  const QUALIDADE_JPEG = 0.72;

  function ehFotoUtil(url) {
    if (!url || typeof url !== 'string') {
      return false;
    }
    return !url.includes('upgrade_access');
  }

  function normalizarFoto(url) {
    return ehFotoUtil(url) ? url : URL_PLACEHOLDER;
  }

  async function capturarComoDataUri(url) {
    if (!ehFotoUtil(url) || url.startsWith('data:') || !url.startsWith('http')) {
      return null;
    }

    try {
      const resposta = await fetch(url);
      if (!resposta.ok) {
        throw new Error('resposta ' + resposta.status);
      }

      const bitmap = await createImageBitmap(await resposta.blob());

      const canvas = document.createElement('canvas');
      canvas.width = LARGURA;
      canvas.height = ALTURA;

      const contexto = canvas.getContext('2d');
      const escala = Math.max(LARGURA / bitmap.width, ALTURA / bitmap.height);
      const larguraFinal = bitmap.width * escala;
      const alturaFinal = bitmap.height * escala;

      contexto.drawImage(
        bitmap,
        (LARGURA - larguraFinal) / 2,
        (ALTURA - alturaFinal) / 2,
        larguraFinal,
        alturaFinal
      );

      bitmap.close();
      return canvas.toDataURL('image/jpeg', QUALIDADE_JPEG);
    } catch (erro) {
      console.warn('Não foi possível copiar a imagem localmente:', erro);
      return null;
    }
  }

  document.addEventListener('error', function (evento) {
    const elemento = evento.target;

    if (!elemento || elemento.tagName !== 'IMG') {
      return;
    }
    if (elemento.dataset.fallbackAplicado === 'sim') {
      return;
    }

    elemento.dataset.fallbackAplicado = 'sim';
    elemento.src = URL_PLACEHOLDER;
  }, true);

  Solaris.imagemModel = {
    URL_PLACEHOLDER: URL_PLACEHOLDER,
    LARGURA: LARGURA,
    ALTURA: ALTURA,
    ehFotoUtil: ehFotoUtil,
    normalizarFoto: normalizarFoto,
    capturarComoDataUri: capturarComoDataUri
  };
})(window.Solaris);
