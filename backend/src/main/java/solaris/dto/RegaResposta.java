package solaris.dto;

import java.time.LocalDateTime;

import solaris.domain.Rega;

public record RegaResposta(Long id, LocalDateTime regadaEm) {

    public static RegaResposta de(Rega rega) {
        return new RegaResposta(rega.getId(), rega.getRegadaEm());
    }
}