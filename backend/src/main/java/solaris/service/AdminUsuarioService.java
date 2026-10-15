package solaris.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import solaris.domain.Perfil;
import solaris.domain.Usuario;
import solaris.dto.PaginaResposta;
import solaris.dto.UsuarioAdminResposta;
import solaris.erro.ConflitoException;
import solaris.erro.RecursoNaoEncontradoException;
import solaris.repository.UsuarioRepository;

@Service
@Transactional
public class AdminUsuarioService {

    private static final Logger log = LoggerFactory.getLogger(AdminUsuarioService.class);

    private final UsuarioRepository usuarios;

    public AdminUsuarioService(UsuarioRepository usuarios) {
        this.usuarios = usuarios;
    }

    @Transactional(readOnly = true)
    public PaginaResposta<UsuarioAdminResposta> listar(int pagina, int tamanho) {
        return PaginaResposta.de(
                usuarios.findAll(PageRequest.of(pagina, tamanho, Sort.by("nome", "id")))
                        .map(UsuarioAdminResposta::de));
    }

    public UsuarioAdminResposta definirAtivo(String adminEmail, Long id, boolean ativo) {
        Usuario usuario = usuarios.findComPerfilById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));

        if (Perfil.ADMIN.equals(usuario.getPerfil().getCodigo())) {
            throw new ConflitoException("Contas de administrador não podem ser desativadas por aqui.");
        }

        usuario.definirAtivo(ativo);
        log.info("Admin {} {} o usuário id={}", adminEmail, ativo ? "reativou" : "desativou", id);
        return UsuarioAdminResposta.de(usuario);
    }
}