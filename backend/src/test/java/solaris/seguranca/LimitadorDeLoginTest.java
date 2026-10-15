package solaris.seguranca;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import solaris.erro.MuitasTentativasException;

class LimitadorDeLoginTest {

    private static final String IP = "203.0.113.10";
    private static final String OUTRO_IP = "203.0.113.20";

    private RelogioDeTeste relogio;
    private LimitadorDeLogin limitador;

    @BeforeEach
    void preparar() {
        relogio = new RelogioDeTeste(Instant.parse("2026-10-15T12:00:00Z"));
        limitador = new LimitadorDeLogin(relogio);
    }

    private void errarVezes(String ip, int vezes) {
        for (int i = 0; i < vezes; i++) {
            limitador.registrarFalha(ip);
        }
    }

    @Test
    @DisplayName("Abaixo do limite de falhas, o IP continua liberado")
    void abaixoDoLimiteContinuaLiberado() {
        errarVezes(IP, LimitadorDeLogin.MAXIMO_FALHAS - 1);

        assertThatCode(() -> limitador.verificar(IP)).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Ao atingir o limite de falhas, o IP é bloqueado")
    void noLimiteBloqueia() {
        errarVezes(IP, LimitadorDeLogin.MAXIMO_FALHAS);

        assertThatThrownBy(() -> limitador.verificar(IP))
                .isInstanceOf(MuitasTentativasException.class);
    }

    @Test
    @DisplayName("O bloqueio informa quantos segundos faltam para liberar")
    void bloqueioInformaTempoRestante() {
        errarVezes(IP, LimitadorDeLogin.MAXIMO_FALHAS);
        relogio.avancar(Duration.ofMinutes(5));

        assertThatThrownBy(() -> limitador.verificar(IP))
                .isInstanceOfSatisfying(MuitasTentativasException.class, ex ->
                        assertThat(ex.getSegundosParaLiberar()).isEqualTo(10 * 60));
    }

    @Test
    @DisplayName("Depois da janela de 15 minutos, o IP é liberado")
    void depoisDaJanelaLibera() {
        errarVezes(IP, LimitadorDeLogin.MAXIMO_FALHAS);
        relogio.avancar(LimitadorDeLogin.JANELA.plusSeconds(1));

        assertThatCode(() -> limitador.verificar(IP)).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Um login correto zera a contagem de falhas")
    void sucessoZeraContagem() {
        errarVezes(IP, LimitadorDeLogin.MAXIMO_FALHAS - 1);
        limitador.registrarSucesso(IP);
        errarVezes(IP, LimitadorDeLogin.MAXIMO_FALHAS - 1);

        assertThatCode(() -> limitador.verificar(IP)).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("O bloqueio de um IP não afeta outro IP")
    void ipsSaoIndependentes() {
        errarVezes(IP, LimitadorDeLogin.MAXIMO_FALHAS);

        assertThatCode(() -> limitador.verificar(OUTRO_IP)).doesNotThrowAnyException();
    }

    /** Relógio controlado pelo teste: o tempo só anda quando mandamos. */
    private static final class RelogioDeTeste extends Clock {

        private Instant agora;

        RelogioDeTeste(Instant inicio) {
            this.agora = inicio;
        }

        void avancar(Duration tempo) {
            agora = agora.plus(tempo);
        }

        @Override
        public Instant instant() {
            return agora;
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zona) {
            return this;
        }
    }
}