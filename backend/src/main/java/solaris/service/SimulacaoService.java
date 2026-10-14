package solaris.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import solaris.domain.Planta;
import solaris.repository.FaseRepository;
import solaris.simulacao.EstadoPlanta;
import solaris.simulacao.LimiteFase;
import solaris.simulacao.Simulacao;

@Service
public class SimulacaoService {

    private final FaseRepository faseRepository;
    private volatile List<LimiteFase> fasesEmCache;

    public SimulacaoService(FaseRepository faseRepository) {
        this.faseRepository = faseRepository;
    }

    public EstadoPlanta calcular(Planta planta, LocalDateTime ultimaRega) {
        return Simulacao.calcular(
                planta.getDataPlantio(),
                ultimaRega,
                planta.getEspecie().getRegimeRega().getIntervaloDias(),
                fases(),
                LocalDateTime.now());
    }

    private List<LimiteFase> fases() {
        List<LimiteFase> fases = fasesEmCache;
        if (fases == null) {
            fases = faseRepository.findAllByOrderByOrdemAsc().stream()
                    .map(f -> new LimiteFase(f.getCodigo(), f.getRotulo(), f.getDiaInicio(), f.getDiaFim()))
                    .toList();
            fasesEmCache = fases;
        }
        return fases;
    }
}