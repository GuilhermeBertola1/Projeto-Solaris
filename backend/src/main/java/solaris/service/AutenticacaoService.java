package solaris.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import solaris.domain.Perfil;
import solaris.domain.Usuario;
import solaris.dto.CadastroRequisicao;
import solaris.dto.UsuarioResposta;
import solaris.erro.ConflitoException;
import solaris.erro.RecursoNaoEncontradoException;
import solaris.repository.PerfilRepository;
import solaris.repository.UsuarioRepository;

@Service
public class AutenticacaoService {

    private final UsuarioRepository usuarios;
    private final PerfilRepository perfis;
    private final PasswordEncoder passwordEncoder;

    public AutenticacaoService(UsuarioRepository usuarios, PerfilRepository perfis,
                               PasswordEncoder passwordEncoder) {
        this.usuarios = usuarios;
        this.perfis = perfis;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UsuarioResposta cadastrar(CadastroRequisicao requisicao) {
        if (usuarios.existsByEmail(requisicao.email())) {
            throw new ConflitoException("Este e-mail já está cadastrado.");
        }

        Perfil perfilUsuario = perfis.findByCodigo(Perfil.USUARIO)
                .orElseThrow(() -> new IllegalStateException("Perfil USUARIO não encontrado."));

        Usuario novo = new Usuario(requisicao.nome(), requisicao.email(),
                passwordEncoder.encode(requisicao.senha()), perfilUsuario);

        return UsuarioResposta.de(usuarios.save(novo));
    }

    @Transactional
    public UsuarioResposta registrarLogin(String email) {
        Usuario usuario = buscarEntidade(email);
        usuario.registrarLogin();
        return UsuarioResposta.de(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioResposta buscarPorEmail(String email) {
        return UsuarioResposta.de(buscarEntidade(email));
    }

    private Usuario buscarEntidade(String email) {
        return usuarios.findByEmail(email)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
    }
}