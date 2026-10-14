package solaris.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

public record PlantaAtualizacaoRequisicao(

        @Size(max = 60, message = "O apelido deve ter no máximo 60 caracteres.")
        String apelido,

        @NotNull(message = "Informe a data de plantio.")
        @PastOrPresent(message = "A data de plantio não pode ser no futuro.")
        LocalDate dataPlantio) {

    public PlantaAtualizacaoRequisicao {
        apelido = (apelido == null || apelido.isBlank()) ? null : apelido.trim();
    }
}