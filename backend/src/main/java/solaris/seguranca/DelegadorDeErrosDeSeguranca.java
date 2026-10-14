package solaris.seguranca;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerExceptionResolver;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class DelegadorDeErrosDeSeguranca implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final HandlerExceptionResolver resolvedor;

    public DelegadorDeErrosDeSeguranca(
            @Qualifier("handlerExceptionResolver") HandlerExceptionResolver resolvedor) {
        this.resolvedor = resolvedor;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException ex) {
        resolvedor.resolveException(request, response, null, ex);
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException ex) {
        resolvedor.resolveException(request, response, null, ex);
    }
}