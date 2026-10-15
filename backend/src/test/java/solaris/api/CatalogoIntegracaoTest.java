package solaris.api;

import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CatalogoIntegracaoTest extends TesteDeIntegracao {

    @Test
    @DisplayName("O catálogo é público e traz as espécies do seed do Flyway")
    void catalogoPublicoComSeed() throws Exception {
        mvc.perform(get("/api/especies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItens", greaterThanOrEqualTo(100)));
    }

    @Test
    @DisplayName("A busca ignora acentos e maiúsculas (collation utf8mb4_0900_ai_ci)")
    void buscaIgnoraAcentos() throws Exception {
        mvc.perform(get("/api/especies").param("q", "HORTELA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens[*].nomePopular", hasItem("Hortelã")));
    }

    @Test
    @DisplayName("Tentativa de SQL Injection na busca é tratada como texto comum")
    void sqlInjectionNaBuscaNaoFunciona() throws Exception {
        mvc.perform(get("/api/especies").param("q", "' OR '1'='1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItens").value(0))
                .andExpect(jsonPath("$.itens", empty()));
    }

    @Test
    @DisplayName("Parâmetro de paginação fora do limite devolve 400 no formato Problem Details")
    void paginacaoForaDoLimite() throws Exception {
        mvc.perform(get("/api/especies").param("tamanho", "500"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("Espécie inexistente devolve 404 com título padronizado")
    void especieInexistente() throws Exception {
        mvc.perform(get("/api/especies/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Recurso não encontrado"));
    }
}