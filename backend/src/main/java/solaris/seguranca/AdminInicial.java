package solaris.seguranca;

import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import solaris.domain.Perfil;
import solaris.domain.Usuario;
import solaris.repository.PerfilRepository;
import solaris.repository.UsuarioRepository;

@Component
public class AdminInicial implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInicial.class);
    private static final int TAMANHO_MINIMO_SENHA = 12;

    private final UsuarioRepository usuarios;
    private final PerfilRepository perfis;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String senha;

    public AdminInicial(UsuarioRepository usuarios,
                        PerfilRepository perfis,
                        PasswordEncoder passwordEncoder,
                        @Value("${ADMIN_EMAIL:}") String email,
                        @Value("${ADMIN_SENHA:}") String senha) {
        this.usuarios = usuarios;
        this.perfis = perfis;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.senha = senha;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (email.isBlank() || senha.isBlank()) {
            log.warn("ADMIN_EMAIL ou ADMIN_SENHA não definidos: nenhum administrador inicial foi criado.");
            return;
        }

        String emailNormalizado = email.trim().toLowerCase(Locale.ROOT);

        if (usuarios.existsByEmail(emailNormalizado)) {
            log.info("Administrador inicial já existe: {}", emailNormalizado);
            return;
        }

        if (senha.length() < TAMANHO_MINIMO_SENHA) {
            throw new IllegalStateException(
                    "ADMIN_SENHA precisa ter pelo menos " + TAMANHO_MINIMO_SENHA + " caracteres.");
        }

        Perfil perfilAdmin = perfis.findByCodigo(Perfil.ADMIN)
                .orElseThrow(() -> new IllegalStateException(
                        "Perfil ADMIN não encontrado. A migração V2 foi aplicada?"));

        usuarios.save(new Usuario("Administrador", emailNormalizado,
                passwordEncoder.encode(senha), perfilAdmin));

        log.info("Administrador inicial criado: {}", emailNormalizado);
    }
}