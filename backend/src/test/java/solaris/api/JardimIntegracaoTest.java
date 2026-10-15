package solaris.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;

import com.jayway.jsonpath.JsonPath;

class JardimIntegracaoTest extends TesteDeIntegracao {

    private static final String SENHA = "senha-de-teste-123";
    private static final int MANJERICAO = 2;

    private long plantar(MockHttpSession sessao, String apelido) throws Exception {
        String resposta = mvc.perform(post("/api/plantas")
                        .session(sessao).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"especieId": %d, "apelido": "%s", "dataPlantio": "%s"}
                                """.formatted(MANJERICAO, apelido, LocalDate.now().minusDays(10))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);

        return ((Number) JsonPath.read(resposta, "$.id")).longValue();
    }

    @Test
    @DisplayName("Ciclo completo: plantar, listar, editar, regar, ver histórico e excluir")
    void cicloCompletoDaPlanta() throws Exception {
        MockHttpSession ana = cadastrarELogar("Ana", emailUnico("ana"), SENHA);
        long id = plantar(ana, "Manjericão da janela");

        mvc.perform(get("/api/plantas/" + id).session(ana))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado.humor").value("FELIZ"))
                .andExpect(jsonPath("$.estado.fase").value("brotacao"));

        mvc.perform(get("/api/plantas").session(ana))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItens").value(1));

        mvc.perform(put("/api/plantas/" + id)
                        .session(ana).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"apelido": "Manjericão do Solaris", "dataPlantio": "%s"}
                                """.formatted(LocalDate.now().minusDays(20))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.apelido").value("Manjericão do Solaris"))
                .andExpect(jsonPath("$.estado.fase").value("vegetativo"));

        mvc.perform(post("/api/plantas/" + id + "/regas").session(ana).with(csrf()))
                .andExpect(status().isCreated());

        mvc.perform(get("/api/plantas/" + id + "/regas").session(ana))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItens").value(2));

        mvc.perform(delete("/api/plantas/" + id).session(ana).with(csrf()))
                .andExpect(status().isNoContent());

        mvc.perform(get("/api/plantas/" + id).session(ana))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Um usuário não vê, edita, rega nem apaga a planta de outro (404)")
    void plantaDeOutroUsuarioEInvisivel() throws Exception {
        MockHttpSession ana = cadastrarELogar("Ana", emailUnico("ana"), SENHA);
        MockHttpSession bruno = cadastrarELogar("Bruno", emailUnico("bruno"), SENHA);
        long plantaDaAna = plantar(ana, "Só da Ana");

        mvc.perform(get("/api/plantas/" + plantaDaAna).session(bruno))
                .andExpect(status().isNotFound());

        mvc.perform(put("/api/plantas/" + plantaDaAna)
                        .session(bruno).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"apelido": "Roubada", "dataPlantio": "%s"}
                                """.formatted(LocalDate.now())))
                .andExpect(status().isNotFound());

        mvc.perform(post("/api/plantas/" + plantaDaAna + "/regas").session(bruno).with(csrf()))
                .andExpect(status().isNotFound());

        mvc.perform(delete("/api/plantas/" + plantaDaAna).session(bruno).with(csrf()))
                .andExpect(status().isNotFound());

        mvc.perform(get("/api/plantas").session(bruno))
                .andExpect(jsonPath("$.totalItens").value(0));

        mvc.perform(get("/api/plantas/" + plantaDaAna).session(ana))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.apelido").value("Só da Ana"));
    }

    @Test
    @DisplayName("Dados inválidos são recusados com 400 e o erro de cada campo")
    void validacaoDosCampos() throws Exception {
        MockHttpSession ana = cadastrarELogar("Ana", emailUnico("ana"), SENHA);

        mvc.perform(post("/api/plantas")
                        .session(ana).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"apelido": "%s", "dataPlantio": "%s"}
                                """.formatted("a".repeat(61), LocalDate.now().plusDays(1))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.especieId").exists())
                .andExpect(jsonPath("$.campos.apelido").exists())
                .andExpect(jsonPath("$.campos.dataPlantio").exists());
    }

    @Test
    @DisplayName("HTML enviado no apelido é guardado e devolvido como texto puro")
    void htmlNoApelidoEhTexto() throws Exception {
        MockHttpSession ana = cadastrarELogar("Ana", emailUnico("ana"), SENHA);
        String ataque = "<script>alert('xss')</script>";

        long id = plantar(ana, ataque);

        mvc.perform(get("/api/plantas/" + id).session(ana))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.apelido").value(ataque));
    }
}