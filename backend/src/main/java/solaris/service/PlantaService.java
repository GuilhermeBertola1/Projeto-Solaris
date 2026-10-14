package solaris.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import solaris.domain.Especie;
import solaris.domain.Planta;
import solaris.domain.Rega;
import solaris.domain.Usuario;
import solaris.dto.PaginaResposta;
import solaris.dto.PlantaAtualizacaoRequisicao;
import solaris.dto.PlantaRequisicao;
import solaris.dto.PlantaResposta;
import solaris.erro.RecursoNaoEncontradoException;
import solaris.repository.EspecieRepository;
import solaris.repository.PlantaRepository;
import solaris.repository.RegaRepository;
import solaris.repository.UsuarioRepository;
import solaris.dto.RegaResposta;

@Service
@Transactional
public class PlantaService {

    private final PlantaRepository plantas;
    private final RegaRepository regas;
    private final EspecieRepository especies;
    private final UsuarioRepository usuarios;
    private final SimulacaoService simulacao;

    public PlantaService(PlantaRepository plantas, RegaRepository regas,
                         EspecieRepository especies, UsuarioRepository usuarios,
                         SimulacaoService simulacao) {
        this.plantas = plantas;
        this.regas = regas;
        this.especies = especies;
        this.usuarios = usuarios;
        this.simulacao = simulacao;
    }

    @Transactional(readOnly = true)
    public PaginaResposta<PlantaResposta> listar(String email, int pagina, int tamanho) {
        Pageable pageable = PageRequest.of(pagina, tamanho, Sort.by("criadoEm", "id"));
        return PaginaResposta.de(
                plantas.findByUsuarioId(buscarUsuario(email).getId(), pageable)
                        .map(this::paraResposta));
    }

    @Transactional(readOnly = true)
    public PlantaResposta buscar(String email, Long id) {
        return paraResposta(buscarPlantaDoUsuario(email, id));
    }

    public PlantaResposta criar(String email, PlantaRequisicao requisicao) {
        Usuario dono = buscarUsuario(email);
        Especie especie = especies.findByIdAndAtivoTrue(requisicao.especieId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Espécie não encontrada."));

        Planta planta = plantas.save(
                new Planta(dono, especie, requisicao.apelido(), requisicao.dataPlantio()));
        regas.save(new Rega(planta));

        return paraResposta(planta);
    }

    public PlantaResposta atualizar(String email, Long id, PlantaAtualizacaoRequisicao requisicao) {
        Planta planta = buscarPlantaDoUsuario(email, id);
        planta.atualizar(requisicao.apelido(), requisicao.dataPlantio());
        return paraResposta(planta);
    }

    public void excluir(String email, Long id) {
        plantas.delete(buscarPlantaDoUsuario(email, id));
    }

    public PlantaResposta regar(String email, Long id) {
        Planta planta = buscarPlantaDoUsuario(email, id);
        regas.save(new Rega(planta));
        return paraResposta(planta);
    }

    @Transactional(readOnly = true)
    public PaginaResposta<RegaResposta> historicoDeRegas(String email, Long id, int pagina, int tamanho) {
        Planta planta = buscarPlantaDoUsuario(email, id);
        return PaginaResposta.de(
                regas.findByPlantaIdOrderByRegadaEmDesc(planta.getId(), PageRequest.of(pagina, tamanho))
                        .map(RegaResposta::de));
    }

    private Planta buscarPlantaDoUsuario(String email, Long id) {
        return plantas.findByIdAndUsuarioId(id, buscarUsuario(email).getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Planta não encontrada."));
    }

    private Usuario buscarUsuario(String email) {
        return usuarios.findByEmail(email)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
    }

    private PlantaResposta paraResposta(Planta planta) {
        LocalDateTime ultimaRega = regas.findFirstByPlantaIdOrderByRegadaEmDesc(planta.getId())
                .map(Rega::getRegadaEm)
                .orElse(null);
        return PlantaResposta.de(planta, simulacao.calcular(planta, ultimaRega));
    }
}