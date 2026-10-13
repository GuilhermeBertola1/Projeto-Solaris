package solaris.dto;

import java.util.List;

import org.springframework.data.domain.Page;

public record PaginaResposta<T>(
        List<T> itens,
        int pagina,
        int tamanho,
        long totalItens,
        int totalPaginas) {

    public static <T> PaginaResposta<T> de(Page<T> page) {
        return new PaginaResposta<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages());
    }
}