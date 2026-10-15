package solaris.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import solaris.dto.EspecieResposta;
import solaris.dto.PaginaResposta;
import solaris.erro.RecursoNaoEncontradoException;
import solaris.repository.EspecieRepository;
import org.springframework.data.domain.Page;
import solaris.domain.Especie;

@Service
@Transactional(readOnly = true)
public class EspecieService {

    private final EspecieRepository repositorio;

    public EspecieService(EspecieRepository repositorio) {
        this.repositorio = repositorio;
    }

    public PaginaResposta<EspecieResposta> listar(String termo, int pagina, int tamanho) {
        Pageable pageable = PageRequest.of(pagina, tamanho, Sort.by("nomePopular", "id"));

        Page<Especie> resultado = (termo == null || termo.isBlank())
                ? repositorio.findByAtivoTrue(pageable)
                : repositorio.buscarAtivasPorNome(termo.trim(), pageable);

        return PaginaResposta.de(resultado.map(EspecieResposta::de));
    }

    public EspecieResposta buscar(Integer id) {
        return repositorio.findByIdAndAtivoTrue(id)
                .map(EspecieResposta::de)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Espécie não encontrada."));
    }
}