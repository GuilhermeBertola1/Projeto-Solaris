package solaris.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import solaris.domain.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    @EntityGraph(attributePaths = "perfil")
    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    @Override
    @EntityGraph(attributePaths = "perfil")
    Page<Usuario> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "perfil")
    Optional<Usuario> findComPerfilById(Long id);

    boolean existsByEmailAndAtivoTrue(String email);
}