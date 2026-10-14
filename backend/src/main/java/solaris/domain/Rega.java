package solaris.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "rega")
public class Rega {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", columnDefinition = "BIGINT UNSIGNED")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "planta_id", nullable = false, columnDefinition = "BIGINT UNSIGNED")
    private Planta planta;

    @Column(name = "regada_em", nullable = false)
    private LocalDateTime regadaEm;

    protected Rega() { }

    public Rega(Planta planta) {
        this.planta = planta;
        this.regadaEm = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Planta getPlanta() { return planta; }
    public LocalDateTime getRegadaEm() { return regadaEm; }
}