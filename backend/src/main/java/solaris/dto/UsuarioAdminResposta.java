package solaris.dto;

import java.time.LocalDateTime;

import solaris.domain.Usuario;

public record UsuarioAdminResposta(
        Long id,
        String nome,
        String email,
        String perfil,
        Boolean ativo,
        LocalDateTime ultimoLoginEm,
        LocalDateTime criadoEm) {

    public static UsuarioAdminResposta de(Usuario u) {
        return new UsuarioAdminResposta(
                u.getId(),
                u.getNome(),
                u.getEmail(),
                u.getPerfil().getCodigo(),
                u.getAtivo(),
                u.getUltimoLoginEm(),
                u.getCriadoEm());
    }
}