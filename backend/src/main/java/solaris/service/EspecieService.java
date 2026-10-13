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

@Service
@Transactional(readOnly = true)
public class EspecieService {

    private final EspecieRepository repositorio;

    public EspecieService(EspecieRepository repositorio) {
        this.repositorio = repositorio;
    }

    public PaginaResposta<EspecieResposta> listar(int pagina, int tamanho) {
        Pageable pageable = PageRequest.of(pagina, tamanho, Sort.by("nomePopular", "id"));
        return PaginaResposta.de(
                repositorio.findByAtivoTrue(pageable).map(EspecieResposta::de));
    }

    public EspecieResposta buscar(Integer id) {
        return repositorio.findByIdAndAtivoTrue(id)
                .map(EspecieResposta::de)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Espécie não encontrada."));
    }
}