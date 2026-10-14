package solaris.dto;

import java.util.Locale;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequisicao(

        @NotBlank(message = "Informe o e-mail.")
        @Size(max = 254, message = "E-mail muito longo.")
        String email,

        @NotBlank(message = "Informe a senha.")
        @Size(max = 72, message = "Senha muito longa.")
        String senha) {

    public LoginRequisicao {
        email = email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}