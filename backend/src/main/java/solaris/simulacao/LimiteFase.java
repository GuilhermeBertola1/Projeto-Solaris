package solaris.simulacao;

public record LimiteFase(String codigo, String rotulo, int diaInicio, Integer diaFim) {

    public boolean contem(long dias) {
        return dias >= diaInicio && (diaFim == null || dias < diaFim);
    }
}