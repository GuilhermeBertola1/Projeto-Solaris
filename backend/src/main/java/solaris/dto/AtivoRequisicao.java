package solaris.dto;

import jakarta.validation.constraints.NotNull;

public record AtivoRequisicao(
        @NotNull(message = "Informe se o registro deve ficar ativo.")
        Boolean ativo) {
}