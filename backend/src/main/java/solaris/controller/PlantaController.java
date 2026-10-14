package solaris.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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
import solaris.dto.PaginaResposta;
import solaris.dto.PlantaAtualizacaoRequisicao;
import solaris.dto.PlantaRequisicao;
import solaris.dto.PlantaResposta;
import solaris.service.PlantaService;

@RestController
@RequestMapping("/api/plantas")
public class PlantaController {

    private final PlantaService service;

    public PlantaController(PlantaService service) {
        this.service = service;
    }

    @GetMapping
    public PaginaResposta<PlantaResposta> listar(
            Authentication autenticacao,
            @RequestParam(defaultValue = "0") @Min(0) int pagina,
            @RequestParam(defaultValue = "20") @Min(1) @Max(50) int tamanho) {
        return service.listar(autenticacao.getName(), pagina, tamanho);
    }

    @GetMapping("/{id}")
    public PlantaResposta buscar(Authentication autenticacao, @PathVariable Long id) {
        return service.buscar(autenticacao.getName(), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PlantaResposta criar(Authentication autenticacao,
                                @Valid @RequestBody PlantaRequisicao requisicao) {
        return service.criar(autenticacao.getName(), requisicao);
    }

    @PutMapping("/{id}")
    public PlantaResposta atualizar(Authentication autenticacao, @PathVariable Long id,
                                    @Valid @RequestBody PlantaAtualizacaoRequisicao requisicao) {
        return service.atualizar(autenticacao.getName(), id, requisicao);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(Authentication autenticacao, @PathVariable Long id) {
        service.excluir(autenticacao.getName(), id);
    }
}