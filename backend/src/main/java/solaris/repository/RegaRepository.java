package solaris.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import solaris.domain.Rega;

public interface RegaRepository extends JpaRepository<Rega, Long> {

    Optional<Rega> findFirstByPlantaIdOrderByRegadaEmDesc(Long plantaId);

    Page<Rega> findByPlantaIdOrderByRegadaEmDesc(Long plantaId, Pageable pageable);
}