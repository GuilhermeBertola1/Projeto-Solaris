package solaris.seguranca;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import solaris.repository.UsuarioRepository;

@Configuration
public class SegurancaConfig {

    @Bean
    public SecurityFilterChain filtroDeSeguranca(HttpSecurity http,
            SecurityContextRepository repositorioDeContexto,
            DelegadorDeErrosDeSeguranca errosDeSeguranca,
            UsuarioRepository usuarios) throws Exception {
        http
            .authorizeHttpRequests(regras -> regras
                .requestMatchers(HttpMethod.GET, "/api/especies/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auth/csrf").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/cadastro", "/api/auth/login").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll())
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
            .securityContext(contexto -> contexto
                .securityContextRepository(repositorioDeContexto))
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(HttpStatus.NO_CONTENT))
                .deleteCookies("JSESSIONID"))
            .exceptionHandling(erros -> erros
                .authenticationEntryPoint(errosDeSeguranca)
                .accessDeniedHandler(errosDeSeguranca))
            .headers(cabecalhos -> cabecalhos
                .contentSecurityPolicy(csp -> csp.policyDirectives(
                    "default-src 'self'; " +
                    "script-src 'self'; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "img-src 'self' https: data:; " +
                    "object-src 'none'; " +
                    "base-uri 'self'; " +
                    "form-action 'self'; " +
                    "frame-ancestors 'none'"))
                .referrerPolicy(referrer -> referrer.policy(
                    ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)))
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable);
        
        http.addFilterAfter(new FiltroContaAtiva(usuarios), SecurityContextHolderFilter.class);

        return http.build();
    }

    @Bean
    public SecurityContextRepository repositorioDeContexto() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    public AuthenticationManager authenticationManager(UserDetailsService usuarioDetailsService,
                                                       PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provedor = new DaoAuthenticationProvider(usuarioDetailsService);
        provedor.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provedor);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public RoleHierarchy hierarquiaDePerfis() {
        return RoleHierarchyImpl.fromHierarchy("ROLE_ADMIN > ROLE_USUARIO");
    }
}