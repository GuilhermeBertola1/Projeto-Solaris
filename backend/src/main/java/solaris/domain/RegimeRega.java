package solaris.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "regime_rega")
public class RegimeRega {

    @Id
    @Column(name = "id", columnDefinition = "TINYINT UNSIGNED")
    private Short id;

    @Column(name = "codigo", nullable = false, length = 20)
    private String codigo;

    @Column(name = "intervalo_dias", nullable = false, columnDefinition = "TINYINT UNSIGNED")
    private Short intervaloDias;

    @Column(name = "descricao", nullable = false, length = 80)
    private String descricao;

    protected RegimeRega() { }

    public Short getId() { return id; }
    public String getCodigo() { return codigo; }
    public Short getIntervaloDias() { return intervaloDias; }
    public String getDescricao() { return descricao; }
}