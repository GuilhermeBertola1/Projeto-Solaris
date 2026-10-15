package solaris.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import solaris.dto.AtivoRequisicao;
import solaris.dto.EspecieAdminResposta;
import solaris.dto.EspecieRequisicao;
import solaris.dto.PaginaResposta;
import solaris.service.AdminEspecieService;
import solaris.dto.OpcoesEspecieResposta;

@RestController
@RequestMapping("/api/admin/especies")
public class AdminEspecieController {

    private final AdminEspecieService service;

    public AdminEspecieController(AdminEspecieService service) {
        this.service = service;
    }

    @GetMapping
    public PaginaResposta<EspecieAdminResposta> listar(
            @RequestParam(defaultValue = "0") @Min(0) int pagina,
            @RequestParam(defaultValue = "20") @Min(1) @Max(50) int tamanho) {
        return service.listar(pagina, tamanho);
    }

    @GetMapping("/opcoes")
    public OpcoesEspecieResposta opcoes() {
        return service.opcoes();
    }

    @GetMapping("/{id}")
    public EspecieAdminResposta buscar(@PathVariable Integer id) {
        return service.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EspecieAdminResposta criar(Authentication autenticacao,
                                      @Valid @RequestBody EspecieRequisicao requisicao) {
        return service.criar(autenticacao.getName(), requisicao);
    }

    @PutMapping("/{id}")
    public EspecieAdminResposta atualizar(Authentication autenticacao, @PathVariable Integer id,
                                          @Valid @RequestBody EspecieRequisicao requisicao) {
        return service.atualizar(autenticacao.getName(), id, requisicao);
    }

    @PatchMapping("/{id}/ativo")
    public EspecieAdminResposta definirAtivo(Authentication autenticacao, @PathVariable Integer id,
                                             @Valid @RequestBody AtivoRequisicao requisicao) {
        return service.definirAtivo(autenticacao.getName(), id, requisicao.ativo());
    }
}