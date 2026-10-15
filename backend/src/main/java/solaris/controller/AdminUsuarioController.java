package solaris.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import solaris.dto.AtivoRequisicao;
import solaris.dto.PaginaResposta;
import solaris.dto.UsuarioAdminResposta;
import solaris.service.AdminUsuarioService;

@RestController
@RequestMapping("/api/admin/usuarios")
public class AdminUsuarioController {

    private final AdminUsuarioService service;

    public AdminUsuarioController(AdminUsuarioService service) {
        this.service = service;
    }

    @GetMapping
    public PaginaResposta<UsuarioAdminResposta> listar(
            @RequestParam(defaultValue = "0") @Min(0) int pagina,
            @RequestParam(defaultValue = "20") @Min(1) @Max(50) int tamanho) {
        return service.listar(pagina, tamanho);
    }

    @PatchMapping("/{id}/ativo")
    public UsuarioAdminResposta definirAtivo(Authentication autenticacao, @PathVariable Long id,
                                             @Valid @RequestBody AtivoRequisicao requisicao) {
        return service.definirAtivo(autenticacao.getName(), id, requisicao.ativo());
    }
}