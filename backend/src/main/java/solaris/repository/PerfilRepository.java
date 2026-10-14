package solaris.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import solaris.domain.Perfil;

public interface PerfilRepository extends JpaRepository<Perfil, Short> {

    Optional<Perfil> findByCodigo(String codigo);
}