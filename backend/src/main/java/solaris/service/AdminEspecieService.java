package solaris.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import solaris.domain.Categoria;
import solaris.domain.Especie;
import solaris.domain.NivelLuz;
import solaris.domain.RegimeRega;
import solaris.dto.EspecieAdminResposta;
import solaris.dto.EspecieRequisicao;
import solaris.dto.PaginaResposta;
import solaris.erro.RecursoNaoEncontradoException;
import solaris.repository.CategoriaRepository;
import solaris.repository.EspecieRepository;
import solaris.repository.NivelLuzRepository;
import solaris.repository.RegimeRegaRepository;

@Service
@Transactional
public class AdminEspecieService {

    private static final Logger log = LoggerFactory.getLogger(AdminEspecieService.class);

    private final EspecieRepository especies;
    private final CategoriaRepository categorias;
    private final NivelLuzRepository niveisDeLuz;
    private final RegimeRegaRepository regimesDeRega;

    public AdminEspecieService(EspecieRepository especies, CategoriaRepository categorias,
                               NivelLuzRepository niveisDeLuz, RegimeRegaRepository regimesDeRega) {
        this.especies = especies;
        this.categorias = categorias;
        this.niveisDeLuz = niveisDeLuz;
        this.regimesDeRega = regimesDeRega;
    }

    @Transactional(readOnly = true)
    public PaginaResposta<EspecieAdminResposta> listar(int pagina, int tamanho) {
        return PaginaResposta.de(
                especies.findAll(PageRequest.of(pagina, tamanho, Sort.by("nomePopular", "id")))
                        .map(EspecieAdminResposta::de));
    }

    @Transactional(readOnly = true)
    public EspecieAdminResposta buscar(Integer id) {
        return EspecieAdminResposta.de(buscarEspecie(id));
    }

    public EspecieAdminResposta criar(String adminEmail, EspecieRequisicao r) {
        Especie nova = especies.save(new Especie(
                r.nomePopular(), r.nomeCientifico(),
                buscarCategoria(r.categoriaId()), buscarNivelLuz(r.nivelLuzId()),
                buscarRegimeRega(r.regimeRegaId()), r.dificuldade(), r.fotoUrl()));

        log.info("Admin {} cadastrou a espécie id={}", adminEmail, nova.getId());
        return EspecieAdminResposta.de(nova);
    }

    public EspecieAdminResposta atualizar(String adminEmail, Integer id, EspecieRequisicao r) {
        Especie especie = buscarEspecie(id);
        especie.atualizar(
                r.nomePopular(), r.nomeCientifico(),
                buscarCategoria(r.categoriaId()), buscarNivelLuz(r.nivelLuzId()),
                buscarRegimeRega(r.regimeRegaId()), r.dificuldade(), r.fotoUrl());

        log.info("Admin {} editou a espécie id={}", adminEmail, id);
        return EspecieAdminResposta.de(especie);
    }

    public EspecieAdminResposta definirAtivo(String adminEmail, Integer id, boolean ativo) {
        Especie especie = buscarEspecie(id);
        especie.definirAtivo(ativo);

        log.info("Admin {} {} a espécie id={}", adminEmail, ativo ? "reativou" : "desativou", id);
        return EspecieAdminResposta.de(especie);
    }

    private Especie buscarEspecie(Integer id) {
        return especies.findComRelacoesById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Espécie não encontrada."));
    }

    private Categoria buscarCategoria(Short id) {
        return categorias.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada."));
    }

    private NivelLuz buscarNivelLuz(Short id) {
        if (id == null) {
            return null;
        }
        return niveisDeLuz.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Nível de luz não encontrado."));
    }

    private RegimeRega buscarRegimeRega(Short id) {
        return regimesDeRega.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Regime de rega não encontrado."));
    }
}