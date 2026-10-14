package solaris.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import solaris.domain.Dificuldade;

public record EspecieRequisicao(

        @NotBlank(message = "Informe o nome popular.")
        @Size(max = 100, message = "O nome popular deve ter no máximo 100 caracteres.")
        String nomePopular,

        @NotBlank(message = "Informe o nome científico.")
        @Size(max = 150, message = "O nome científico deve ter no máximo 150 caracteres.")
        String nomeCientifico,

        @NotNull(message = "Informe a categoria.")
        @Positive(message = "Categoria inválida.")
        Short categoriaId,

        @Positive(message = "Nível de luz inválido.")
        Short nivelLuzId,

        @NotNull(message = "Informe o regime de rega.")
        @Positive(message = "Regime de rega inválido.")
        Short regimeRegaId,

        @NotNull(message = "Informe a dificuldade.")
        Dificuldade dificuldade,

        @Size(max = 255, message = "A URL da foto deve ter no máximo 255 caracteres.")
        @Pattern(regexp = "^(https://\\S+|assets/images/[\\w.-]+)$",
                 message = "A foto deve ser uma URL https:// ou um arquivo em assets/images/.")
        String fotoUrl) {

    public EspecieRequisicao {
        nomePopular = nomePopular == null ? null : nomePopular.trim();
        nomeCientifico = nomeCientifico == null ? null : nomeCientifico.trim();
        fotoUrl = (fotoUrl == null || fotoUrl.isBlank()) ? null : fotoUrl.trim();
    }
}