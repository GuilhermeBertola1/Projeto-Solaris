package solaris.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "especie")
public class Especie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", columnDefinition = "INT UNSIGNED")
    private Integer id;

    @Column(name = "nome_popular", nullable = false, length = 100)
    private String nomePopular;

    @Column(name = "nome_cientifico", nullable = false, length = 150)
    private String nomeCientifico;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false, columnDefinition = "TINYINT UNSIGNED")
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nivel_luz_id", columnDefinition = "TINYINT UNSIGNED")
    private NivelLuz nivelLuz;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "regime_rega_id", nullable = false, columnDefinition = "TINYINT UNSIGNED")
    private RegimeRega regimeRega;

    @Enumerated(EnumType.STRING)
    @Column(name = "dificuldade", nullable = false, columnDefinition = "VARCHAR(15)")
    private Dificuldade dificuldade;

    @Column(name = "foto_url", length = 255)
    private String fotoUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "origem", nullable = false, columnDefinition = "VARCHAR(10)")
    private OrigemEspecie origem;

    @Column(name = "perenual_id", columnDefinition = "INT UNSIGNED")
    private Integer perenualId;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo;

    @Column(name = "criado_em", nullable = false, insertable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false, insertable = false, updatable = false)
    private LocalDateTime atualizadoEm;

    protected Especie() { }

    public Especie(String nomePopular, String nomeCientifico, Categoria categoria,
                   NivelLuz nivelLuz, RegimeRega regimeRega, Dificuldade dificuldade,
                   String fotoUrl) {
        this.nomePopular = nomePopular;
        this.nomeCientifico = nomeCientifico;
        this.categoria = categoria;
        this.nivelLuz = nivelLuz;
        this.regimeRega = regimeRega;
        this.dificuldade = dificuldade;
        this.fotoUrl = fotoUrl;
        this.origem = OrigemEspecie.LOCAL;
        this.ativo = true;
    }

    public void atualizar(String nomePopular, String nomeCientifico, Categoria categoria,
                          NivelLuz nivelLuz, RegimeRega regimeRega, Dificuldade dificuldade,
                          String fotoUrl) {
        this.nomePopular = nomePopular;
        this.nomeCientifico = nomeCientifico;
        this.categoria = categoria;
        this.nivelLuz = nivelLuz;
        this.regimeRega = regimeRega;
        this.dificuldade = dificuldade;
        this.fotoUrl = fotoUrl;
    }

    public void definirAtivo(boolean ativo) {
        this.ativo = ativo;
    }

    public Integer getId() { return id; }
    public String getNomePopular() { return nomePopular; }
    public String getNomeCientifico() { return nomeCientifico; }
    public Categoria getCategoria() { return categoria; }
    public NivelLuz getNivelLuz() { return nivelLuz; }
    public RegimeRega getRegimeRega() { return regimeRega; }
    public Dificuldade getDificuldade() { return dificuldade; }
    public String getFotoUrl() { return fotoUrl; }
    public OrigemEspecie getOrigem() { return origem; }
    public Integer getPerenualId() { return perenualId; }
    public Boolean getAtivo() { return ativo; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public LocalDateTime getAtualizadoEm() { return atualizadoEm; }
}