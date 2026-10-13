package solaris.dto;

import solaris.domain.Dificuldade;
import solaris.domain.Especie;
import solaris.domain.NivelLuz;

public record EspecieResposta(
        Integer id,
        String nomePopular,
        String nomeCientifico,
        String categoria,
        String categoriaRotulo,
        String luz,
        String regimeRega,
        Short intervaloRegaDias,
        Dificuldade dificuldade,
        String fotoUrl) {

    public static EspecieResposta de(Especie e) {
        NivelLuz luz = e.getNivelLuz();
        return new EspecieResposta(
                e.getId(),
                e.getNomePopular(),
                e.getNomeCientifico(),
                e.getCategoria().getCodigo(),
                e.getCategoria().getRotulo(),
                luz == null ? null : luz.getRotulo(),
                e.getRegimeRega().getCodigo(),
                e.getRegimeRega().getIntervaloDias(),
                e.getDificuldade(),
                e.getFotoUrl());
    }
}