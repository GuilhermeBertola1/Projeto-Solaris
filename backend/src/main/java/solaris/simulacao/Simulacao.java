package solaris.simulacao;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

public final class Simulacao {

    private static final double MINUTOS_POR_DIA = 24 * 60;

    private Simulacao() { }

    public static EstadoPlanta calcular(LocalDate dataPlantio,
                                        LocalDateTime ultimaRega,
                                        int intervaloRegaDias,
                                        List<LimiteFase> fases,
                                        LocalDateTime agora) {

        long diasDePlantada = Math.max(0, ChronoUnit.DAYS.between(dataPlantio, agora.toLocalDate()));

        LocalDateTime referenciaRega = ultimaRega != null ? ultimaRega : dataPlantio.atStartOfDay();
        double diasSemRegar = Math.max(0,
                Duration.between(referenciaRega, agora).toMinutes() / MINUTOS_POR_DIA);

        long diasAteProximaRega = (long) Math.ceil(intervaloRegaDias - diasSemRegar);

        Humor humor;
        if (diasSemRegar > intervaloRegaDias) {
            humor = Humor.SEDENTA;
        } else if (diasSemRegar > intervaloRegaDias / 2.0) {
            humor = Humor.ATENCAO;
        } else {
            humor = Humor.FELIZ;
        }

        LimiteFase fase = faseDoDia(diasDePlantada, fases);

        return new EstadoPlanta(
                diasDePlantada,
                fase.codigo(),
                fase.rotulo(),
                progresso(fase, diasDePlantada),
                humor,
                intervaloRegaDias,
                diasAteProximaRega,
                ultimaRega);
    }

    static LimiteFase faseDoDia(long dias, List<LimiteFase> fases) {
        for (LimiteFase fase : fases) {
            if (fase.contem(dias)) {
                return fase;
            }
        }
        throw new IllegalStateException("Nenhuma fase cobre o dia " + dias);
    }

    static int progresso(LimiteFase fase, long diasDePlantada) {
        if (fase.diaFim() == null) {
            return 100;
        }
        long diaNaFase = diasDePlantada - fase.diaInicio();
        int totalDaFase = fase.diaFim() - fase.diaInicio();
        return (int) Math.min(100, Math.round(diaNaFase * 100.0 / totalDaFase));
    }
}