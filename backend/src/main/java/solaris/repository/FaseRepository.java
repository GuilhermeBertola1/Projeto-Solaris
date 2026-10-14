package solaris.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import solaris.domain.Fase;

public interface FaseRepository extends JpaRepository<Fase, Short> {

    List<Fase> findAllByOrderByOrdemAsc();
}