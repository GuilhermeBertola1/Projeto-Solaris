package solaris.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "categoria")
public class Categoria {
    @Id
    @Column(name = "Id", columnDefinition = "TINYINT UNSIGNED")
    private Short id;

    @Column(name = "codigo", nullable = false, length = 20)
    private String codigo;

    @Column(name = "rotulo", nullable = false, length = 40)
    private String rotulo;

    protected Categoria() {
    }

    public Short getId() {
        return id;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getRotulo() {
        return rotulo;
    }
}