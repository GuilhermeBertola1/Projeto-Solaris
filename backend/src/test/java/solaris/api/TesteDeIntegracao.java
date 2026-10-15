package solaris.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import solaris.seguranca.LimitadorDeLogin;

/**
 * Base dos testes de integração: aplicação completa + MySQL descartável.
 * As propriedades abaixo deixam os testes independentes do .env da máquina.
 */
@SpringBootTest(properties = {
        "DB_URL=jdbc:mysql://substituido-pelo-testcontainers",
        "DB_USUARIO=substituido-pelo-testcontainers",
        "DB_SENHA=substituido-pelo-testcontainers",
        "ADMIN_EMAIL=" + TesteDeIntegracao.ADMIN_EMAIL,
        "ADMIN_SENHA=" + TesteDeIntegracao.ADMIN_SENHA,
        "PERENUAL_API_KEY="
})
@AutoConfigureMockMvc
@Import(ContainersDeTeste.class)
public abstract class TesteDeIntegracao {

    protected static final String ADMIN_EMAIL = "admin@teste.solaris";
    protected static final String ADMIN_SENHA = "senha-do-admin-de-teste";

    // O MockMvc simula todas as requisições vindo deste endereço.
    private static final String IP_DOS_TESTES = "127.0.0.1";

    @Autowired
    protected MockMvc mvc;

    @Autowired
    private LimitadorDeLogin limitador;

    @BeforeEach
    void zerarLimitadorDeLogin() {
        limitador.registrarSucesso(IP_DOS_TESTES);
    }

    protected String emailUnico(String prefixo) {
        return prefixo + "-" + UUID.randomUUID() + "@teste.solaris";
    }

    protected MockHttpSession cadastrarELogar(String nome, String email, String senha) throws Exception {
        mvc.perform(post("/api/auth/cadastro")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome": "%s", "email": "%s", "senha": "%s"}
                                """.formatted(nome, email, senha)))
                .andExpect(status().isCreated());

        return logar(email, senha);
    }

    protected MockHttpSession logar(String email, String senha) throws Exception {
        MvcResult resultado = mvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "%s", "senha": "%s"}
                                """.formatted(email, senha)))
                .andExpect(status().isOk())
                .andReturn();

        return (MockHttpSession) resultado.getRequest().getSession(false);
    }
}