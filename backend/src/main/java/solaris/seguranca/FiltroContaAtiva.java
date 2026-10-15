package solaris.seguranca;

import java.io.IOException;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import solaris.repository.UsuarioRepository;

public class FiltroContaAtiva extends OncePerRequestFilter {

    private final UsuarioRepository usuarios;

    public FiltroContaAtiva(UsuarioRepository usuarios) {
        this.usuarios = usuarios;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain cadeia) throws ServletException, IOException {
        Authentication autenticacao = SecurityContextHolder.getContext().getAuthentication();

        if (autenticacao != null
                && !(autenticacao instanceof AnonymousAuthenticationToken)
                && !usuarios.existsByEmailAndAtivoTrue(autenticacao.getName())) {

            SecurityContextHolder.clearContext();
            HttpSession sessao = request.getSession(false);
            if (sessao != null) {
                sessao.invalidate();
            }
        }

        cadeia.doFilter(request, response);
    }
}