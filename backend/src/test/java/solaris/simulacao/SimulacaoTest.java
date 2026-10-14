package solaris.simulacao;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SimulacaoTest {

    private static final List<LimiteFase> FASES = List.of(
            new LimiteFase("brotacao", "Brotação", 0, 15),
            new LimiteFase("vegetativo", "Vegetativo", 15, 30),
            new LimiteFase("adulta", "Adulta", 30, null));

    private static final LocalDateTime AGORA = LocalDateTime.of(2026, 10, 14, 12, 0);
    private static final int INTERVALO = 4;

    private EstadoPlanta simular(int diasDesdePlantio, LocalDateTime ultimaRega) {
        LocalDate dataPlantio = AGORA.toLocalDate().minusDays(diasDesdePlantio);
        return Simulacao.calcular(dataPlantio, ultimaRega, INTERVALO, FASES, AGORA);
    }

    @Test
    @DisplayName("Planta recém-plantada está em brotação com progresso zero")
    void recemPlantadaEstaEmBrotacao() {
        EstadoPlanta estado = simular(0, AGORA);

        assertThat(estado.fase()).isEqualTo("brotacao");
        assertThat(estado.diasDePlantada()).isZero();
        assertThat(estado.progressoFase()).isZero();
    }

    @Test
    @DisplayName("No 15º dia a planta passa para a fase vegetativa")
    void dia15EntraNoVegetativo() {
        assertThat(simular(14, AGORA).fase()).isEqualTo("brotacao");
        assertThat(simular(15, AGORA).fase()).isEqualTo("vegetativo");
    }

    @Test
    @DisplayName("Planta adulta tem progresso 100%")
    void adultaTemProgressoCompleto() {
        EstadoPlanta estado = simular(45, AGORA);

        assertThat(estado.fase()).isEqualTo("adulta");
        assertThat(estado.progressoFase()).isEqualTo(100);
    }

    @Test
    @DisplayName("Planta regada agora está feliz e a próxima rega é no intervalo completo")
    void regadaAgoraEstaFeliz() {
        EstadoPlanta estado = simular(10, AGORA);

        assertThat(estado.humor()).isEqualTo(Humor.FELIZ);
        assertThat(estado.diasAteProximaRega()).isEqualTo(INTERVALO);
    }

    @Test
    @DisplayName("Depois de metade do intervalo sem água, a planta pede atenção")
    void passouDaMetadeDoIntervaloPedeAtencao() {
        EstadoPlanta estado = simular(10, AGORA.minusDays(3));

        assertThat(estado.humor()).isEqualTo(Humor.ATENCAO);
        assertThat(estado.diasAteProximaRega()).isEqualTo(1);
    }

    @Test
    @DisplayName("Depois do intervalo sem água, a planta fica sedenta e a rega aparece atrasada")
    void passouDoIntervaloFicaSedenta() {
        EstadoPlanta estado = simular(10, AGORA.minusDays(6));

        assertThat(estado.humor()).isEqualTo(Humor.SEDENTA);
        assertThat(estado.diasAteProximaRega()).isEqualTo(-2);
    }

    @Test
    @DisplayName("Planta nunca regada conta o tempo sem água desde o plantio")
    void nuncaRegadaContaDesdeOPlantio() {
        EstadoPlanta estado = simular(10, null);

        assertThat(estado.humor()).isEqualTo(Humor.SEDENTA);
    }
}