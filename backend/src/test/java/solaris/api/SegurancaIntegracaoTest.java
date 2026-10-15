package solaris.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;

import com.jayway.jsonpath.JsonPath;

import solaris.seguranca.LimitadorDeLogin;

class SegurancaIntegracaoTest extends TesteDeIntegracao {

    private static final String SENHA = "senha-de-teste-123";

    @Test
    @DisplayName("Sem login, as rotas do jardim respondem 401")
    void semLoginRespondeNaoAutenticado() throws Exception {
        mvc.perform(get("/api/plantas"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.title").value("Login necessário"));
    }

    @Test
    @DisplayName("POST sem token CSRF é recusado com 403")
    void postSemCsrfRecusado() throws Exception {
        mvc.perform(post("/api/auth/cadastro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome": "Sem Token", "email": "%s", "senha": "%s"}
                                """.formatted(emailUnico("csrf"), SENHA)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title").value("Token CSRF inválido"));
    }

    @Test
    @DisplayName("Senha errada recebe mensagem genérica, sem revelar se o e-mail existe")
    void senhaErradaMensagemGenerica() throws Exception {
        String email = emailUnico("senha");
        cadastrarELogar("Teste Senha", email, SENHA);

        mvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "%s", "senha": "senha-errada"}
                                """.formatted(email)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("E-mail ou senha inválidos."));
    }

    @Test
    @DisplayName("O cadastro ignora um perfil enviado pelo cliente (mass assignment)")
    void cadastroIgnoraPerfilEnviado() throws Exception {
        mvc.perform(post("/api/auth/cadastro")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome": "Mallory", "email": "%s", "senha": "%s", "perfil": "ADMIN"}
                                """.formatted(emailUnico("mallory"), SENHA)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.perfil").value("USUARIO"));
    }

    @Test
    @DisplayName("Usuário comum não acessa rotas de administrador (403)")
    void usuarioComumSemAcessoAoAdmin() throws Exception {
        MockHttpSession ana = cadastrarELogar("Ana", emailUnico("ana"), SENHA);

        mvc.perform(get("/api/admin/especies").session(ana))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title").value("Acesso negado"));
    }

    @Test
    @DisplayName("O administrador acessa a lista de usuários, sem hash de senha na resposta")
    void adminListaUsuariosSemHash() throws Exception {
        MockHttpSession admin = logar(ADMIN_EMAIL, ADMIN_SENHA);

        mvc.perform(get("/api/admin/usuarios").session(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens[0].email").exists())
                .andExpect(jsonPath("$.itens[0].senhaHash").doesNotExist());
    }

    @Test
    @DisplayName("Depois do logout, a sessão antiga não vale mais")
    void logoutInvalidaSessao() throws Exception {
        MockHttpSession sessao = cadastrarELogar("Logout", emailUnico("logout"), SENHA);

        mvc.perform(post("/api/auth/logout").session(sessao).with(csrf()))
                .andExpect(status().isNoContent());

        mvc.perform(get("/api/auth/eu").session(sessao))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Após o limite de senhas erradas, o login é bloqueado com 429, mesmo com a senha certa")
    void limiteDeTentativasBloqueiaLogin() throws Exception {
        String email = emailUnico("forca-bruta");
        cadastrarELogar("Forca Bruta", email, SENHA);

        String senhaErrada = """
                {"email": "%s", "senha": "chute-errado"}
                """.formatted(email);

        for (int i = 0; i < LimitadorDeLogin.MAXIMO_FALHAS; i++) {
            mvc.perform(post("/api/auth/login").with(csrf())
                            .contentType(MediaType.APPLICATION_JSON).content(senhaErrada))
                    .andExpect(status().isUnauthorized());
        }

        mvc.perform(post("/api/auth/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "%s", "senha": "%s"}
                                """.formatted(email, SENHA)))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"));
    }

    @Test
    @DisplayName("Conta desativada pelo admin perde o acesso na hora, mesmo com sessão aberta")
    void contaDesativadaPerdeSessaoAberta() throws Exception {
        MockHttpSession bruno = cadastrarELogar("Bruno", emailUnico("bruno"), SENHA);

        String eu = mvc.perform(get("/api/auth/eu").session(bruno))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        long idDoBruno = ((Number) JsonPath.read(eu, "$.id")).longValue();

        MockHttpSession admin = logar(ADMIN_EMAIL, ADMIN_SENHA);
        mvc.perform(patch("/api/admin/usuarios/" + idDoBruno + "/ativo")
                        .session(admin).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ativo\": false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ativo").value(false));

        mvc.perform(get("/api/plantas").session(bruno))
                .andExpect(status().isUnauthorized());
    }
}