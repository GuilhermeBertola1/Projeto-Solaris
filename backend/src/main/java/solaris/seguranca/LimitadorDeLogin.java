package solaris.seguranca;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import solaris.erro.MuitasTentativasException;

@Component
public class LimitadorDeLogin {

    static final int MAXIMO_FALHAS = 5;
    static final Duration JANELA = Duration.ofMinutes(15);
    private static final int LIMITE_DE_REGISTROS = 10_000;

    private final Map<String, Tentativas> falhasPorIp = new ConcurrentHashMap<>();
    private final Clock relogio;

    public LimitadorDeLogin() {
        this(Clock.systemUTC());
    }

    LimitadorDeLogin(Clock relogio) {
        this.relogio = relogio;
    }

    public void verificar(String ip) {
        Instant agora = relogio.instant();
        Tentativas tentativas = falhasPorIp.get(ip);
        if (tentativas != null && tentativas.bloqueado(agora)) {
            throw new MuitasTentativasException(tentativas.segundosRestantes(agora));
        }
    }

    public void registrarFalha(String ip) {
        Instant agora = relogio.instant();
        if (falhasPorIp.size() > LIMITE_DE_REGISTROS) {
            falhasPorIp.values().removeIf(t -> t.expirou(agora));
        }
        falhasPorIp.compute(ip, (chave, atual) ->
                atual == null || atual.expirou(agora)
                        ? new Tentativas(1, agora)
                        : atual.maisUma());
    }

    public void registrarSucesso(String ip) {
        falhasPorIp.remove(ip);
    }

    private record Tentativas(int quantidade, Instant inicio) {

        Tentativas maisUma() {
            return new Tentativas(quantidade + 1, inicio);
        }

        boolean expirou(Instant agora) {
            return agora.isAfter(inicio.plus(JANELA));
        }

        boolean bloqueado(Instant agora) {
            return quantidade >= MAXIMO_FALHAS && !expirou(agora);
        }

        long segundosRestantes(Instant agora) {
            return Math.max(1, Duration.between(agora, inicio.plus(JANELA)).toSeconds());
        }
    }
}