package solaris.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import solaris.domain.NivelLuz;

public interface NivelLuzRepository extends JpaRepository<NivelLuz, Short> {
}