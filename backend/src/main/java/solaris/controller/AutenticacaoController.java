package solaris.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import solaris.dto.CadastroRequisicao;
import solaris.dto.LoginRequisicao;
import solaris.dto.UsuarioResposta;
import solaris.service.AutenticacaoService;

@RestController
@RequestMapping("/api/auth")
public class AutenticacaoController {

    private static final Logger log = LoggerFactory.getLogger(AutenticacaoController.class);

    private final AutenticacaoService service;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository repositorioDeContexto;

    public AutenticacaoController(AutenticacaoService service,
                                  AuthenticationManager authenticationManager,
                                  SecurityContextRepository repositorioDeContexto) {
        this.service = service;
        this.authenticationManager = authenticationManager;
        this.repositorioDeContexto = repositorioDeContexto;
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("cabecalho", token.getHeaderName(), "token", token.getToken());
    }

    @PostMapping("/cadastro")
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResposta cadastrar(@Valid @RequestBody CadastroRequisicao requisicao) {
        UsuarioResposta novo = service.cadastrar(requisicao);
        log.info("Novo usuário cadastrado: id={}", novo.id());
        return novo;
    }

    @PostMapping("/login")
    public UsuarioResposta login(@Valid @RequestBody LoginRequisicao requisicao,
                                 HttpServletRequest request, HttpServletResponse response) {
        Authentication autenticacao;
        try {
            autenticacao = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(
                            requisicao.email(), requisicao.senha()));
        } catch (AuthenticationException ex) {
            log.warn("Falha de login para {}", requisicao.email());
            throw ex;
        }

        if (request.getSession(false) != null) {
            request.changeSessionId();
        }

        SecurityContext contexto = SecurityContextHolder.createEmptyContext();
        contexto.setAuthentication(autenticacao);
        SecurityContextHolder.setContext(contexto);
        repositorioDeContexto.saveContext(contexto, request, response);

        log.info("Login bem-sucedido: {}", autenticacao.getName());
        return service.registrarLogin(autenticacao.getName());
    }

    @GetMapping("/eu")
    public UsuarioResposta eu(Authentication autenticacao) {
        return service.buscarPorEmail(autenticacao.getName());
    }
}