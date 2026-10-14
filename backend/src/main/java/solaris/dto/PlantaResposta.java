package solaris.dto;

import java.time.LocalDate;

import solaris.domain.Planta;
import solaris.simulacao.EstadoPlanta;

public record PlantaResposta(
        Long id,
        String apelido,
        LocalDate dataPlantio,
        EspecieResposta especie,
        EstadoPlanta estado) {

    public static PlantaResposta de(Planta planta, EstadoPlanta estado) {
        return new PlantaResposta(
                planta.getId(),
                planta.getApelido(),
                planta.getDataPlantio(),
                EspecieResposta.de(planta.getEspecie()),
                estado);
    }
}