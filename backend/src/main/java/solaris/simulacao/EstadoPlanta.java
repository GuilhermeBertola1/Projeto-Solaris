package solaris.simulacao;

import java.time.LocalDateTime;

public record EstadoPlanta(
        long diasDePlantada,
        String fase,
        String faseRotulo,
        int progressoFase,
        Humor humor,
        int intervaloRegaDias,
        long diasAteProximaRega,
        LocalDateTime ultimaRega) {
}