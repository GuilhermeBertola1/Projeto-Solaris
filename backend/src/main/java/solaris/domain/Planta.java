package solaris.domain;

import java.time.LocalDate;
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
@Table(name = "planta")
public class Planta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", columnDefinition = "BIGINT UNSIGNED")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false, columnDefinition = "BIGINT UNSIGNED")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "especie_id", nullable = false, columnDefinition = "INT UNSIGNED")
    private Especie especie;

    @Column(name = "apelido", length = 60)
    private String apelido;

    @Column(name = "data_plantio", nullable = false)
    private LocalDate dataPlantio;

    @Column(name = "criado_em", nullable = false, insertable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false, insertable = false, updatable = false)
    private LocalDateTime atualizadoEm;

    protected Planta() { }

    public Planta(Usuario usuario, Especie especie, String apelido, LocalDate dataPlantio) {
        this.usuario = usuario;
        this.especie = especie;
        this.apelido = apelido;
        this.dataPlantio = dataPlantio;
    }

    public void atualizar(String apelido, LocalDate dataPlantio) {
        this.apelido = apelido;
        this.dataPlantio = dataPlantio;
    }

    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public Especie getEspecie() { return especie; }
    public String getApelido() { return apelido; }
    public LocalDate getDataPlantio() { return dataPlantio; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public LocalDateTime getAtualizadoEm() { return atualizadoEm; }
}