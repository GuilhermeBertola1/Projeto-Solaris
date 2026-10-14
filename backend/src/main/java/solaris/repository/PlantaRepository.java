package solaris.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import solaris.domain.Planta;

public interface PlantaRepository extends JpaRepository<Planta, Long> {

    @EntityGraph(attributePaths = {"especie", "especie.categoria", "especie.nivelLuz", "especie.regimeRega"})
    Page<Planta> findByUsuarioId(Long usuarioId, Pageable pageable);

    @EntityGraph(attributePaths = {"especie", "especie.categoria", "especie.nivelLuz", "especie.regimeRega"})
    Optional<Planta> findByIdAndUsuarioId(Long id, Long usuarioId);
}