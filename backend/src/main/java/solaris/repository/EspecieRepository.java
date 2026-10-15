package solaris.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import solaris.domain.Especie;

public interface EspecieRepository extends JpaRepository<Especie, Integer> {

    @EntityGraph(attributePaths = {"categoria", "nivelLuz", "regimeRega"})
    Page<Especie> findByAtivoTrue(Pageable pageable);

    @EntityGraph(attributePaths = {"categoria", "nivelLuz", "regimeRega"})
    Optional<Especie> findByIdAndAtivoTrue(Integer id);

    @Override
    @EntityGraph(attributePaths = {"categoria", "nivelLuz", "regimeRega"})
    Page<Especie> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"categoria", "nivelLuz", "regimeRega"})
    Optional<Especie> findComRelacoesById(Integer id);

    @EntityGraph(attributePaths = {"categoria", "nivelLuz", "regimeRega"})
    @Query("""
            select e from Especie e
            where e.ativo = true
              and (e.nomePopular like concat('%', :termo, '%')
                   or e.nomeCientifico like concat('%', :termo, '%'))
            """)
    Page<Especie> buscarAtivasPorNome(@Param("termo") String termo, Pageable pageable);
}