package solaris.dto;

import solaris.domain.Dificuldade;
import solaris.domain.Especie;
import solaris.domain.OrigemEspecie;

public record EspecieAdminResposta(
        Integer id,
        String nomePopular,
        String nomeCientifico,
        Short categoriaId,
        Short nivelLuzId,
        Short regimeRegaId,
        Dificuldade dificuldade,
        String fotoUrl,
        OrigemEspecie origem,
        Boolean ativo) {

    public static EspecieAdminResposta de(Especie e) {
        return new EspecieAdminResposta(
                e.getId(),
                e.getNomePopular(),
                e.getNomeCientifico(),
                e.getCategoria().getId(),
                e.getNivelLuz() == null ? null : e.getNivelLuz().getId(),
                e.getRegimeRega().getId(),
                e.getDificuldade(),
                e.getFotoUrl(),
                e.getOrigem(),
                e.getAtivo());
    }
}