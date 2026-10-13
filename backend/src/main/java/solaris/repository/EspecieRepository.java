package solaris.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import solaris.domain.Especie;

public interface EspecieRepository extends JpaRepository<Especie, Integer> {

    @EntityGraph(attributePaths = {"categoria", "nivelLuz", "regimeRega"})
    Page<Especie> findByAtivoTrue(Pageable pageable);

    @EntityGraph(attributePaths = {"categoria", "nivelLuz", "regimeRega"})
    Optional<Especie> findByIdAndAtivoTrue(Integer id);
}