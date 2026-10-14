package solaris.dto;

import solaris.domain.Usuario;

public record UsuarioResposta(Long id, String nome, String email, String perfil) {

    public static UsuarioResposta de(Usuario usuario) {
        return new UsuarioResposta(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil().getCodigo());
    }
}