package solaris.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "nivel_luz")
public class NivelLuz {

    @Id
    @Column(name = "id", columnDefinition = "TINYINT UNSIGNED")
    private Short id;

    @Column(name = "codigo", nullable = false, length = 20)
    private String codigo;

    @Column(name = "rotulo", nullable = false, length = 40)
    private String rotulo;

    @Column(name = "orientacao", nullable = false, length = 300)
    private String orientacao;

    protected NivelLuz() { }

    public Short getId() { return id; }
    public String getCodigo() { return codigo; }
    public String getRotulo() { return rotulo; }
    public String getOrientacao() { return orientacao; }
}