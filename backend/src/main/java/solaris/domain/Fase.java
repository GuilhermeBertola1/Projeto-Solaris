package solaris.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "fase")
public class Fase {

    @Id
    @Column(name = "id", columnDefinition = "TINYINT UNSIGNED")
    private Short id;

    @Column(name = "codigo", nullable = false, length = 20)
    private String codigo;

    @Column(name = "rotulo", nullable = false, length = 40)
    private String rotulo;

    @Column(name = "ordem", nullable = false, columnDefinition = "TINYINT UNSIGNED")
    private Short ordem;

    @Column(name = "dia_inicio", nullable = false, columnDefinition = "SMALLINT UNSIGNED")
    private Integer diaInicio;

    @Column(name = "dia_fim", columnDefinition = "SMALLINT UNSIGNED")
    private Integer diaFim;

    protected Fase() { }

    public Short getId() { return id; }
    public String getCodigo() { return codigo; }
    public String getRotulo() { return rotulo; }
    public Short getOrdem() { return ordem; }
    public Integer getDiaInicio() { return diaInicio; }
    public Integer getDiaFim() { return diaFim; }
}