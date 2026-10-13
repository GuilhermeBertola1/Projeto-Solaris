package solaris.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import solaris.dto.EspecieResposta;
import solaris.dto.PaginaResposta;
import solaris.service.EspecieService;

@RestController
@RequestMapping("/api/especies")
public class EspecieController {

    private final EspecieService service;

    public EspecieController(EspecieService service) {
        this.service = service;
    }

    @GetMapping
    public PaginaResposta<EspecieResposta> listar(
            @RequestParam(defaultValue = "0") @Min(0) int pagina,
            @RequestParam(defaultValue = "20") @Min(1) @Max(50) int tamanho) {
        return service.listar(pagina, tamanho);
    }

    @GetMapping("/{id}")
    public EspecieResposta buscar(@PathVariable Integer id) {
        return service.buscar(id);
    }
}