package solaris.dto;

import java.util.List;

public record OpcoesEspecieResposta(
        List<Opcao> categorias,
        List<Opcao> niveisLuz,
        List<Opcao> regimesRega) {

    public record Opcao(Short id, String rotulo) {
    }
}