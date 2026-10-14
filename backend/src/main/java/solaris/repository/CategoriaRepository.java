package solaris.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import solaris.domain.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, Short> {
}