package com.naviksha.config;

import com.naviksha.security.AdminSecretAuthenticationFilter;
import com.naviksha.security.JwtAuthenticationEntryPoint;
import com.naviksha.security.JwtAuthenticationFilter;
import com.naviksha.service.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Spring Security Configuration
 * 
 * Security Setup:
 * - JWT-based authentication (stateless)
 * - BCrypt password encoding
 * - CORS configuration for frontend integration
 * - Role-based access control (USER, ADMIN)
 * 
 * Public Endpoints:
 * - /api/auth/** (login, register)
 * - /api/reports/demo/** (sample reports)
 * - /health (health check)
 * - /swagger-ui/** (API docs)
 * 
 * Protected Endpoints:
 * - /api/** (requires authentication)
 * - /admin/** (requires ADMIN role)
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AdminSecretAuthenticationFilter adminSecretAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Get allowed origins from environment variable or use defaults
        String allowedOrigins = System.getenv("CORS_ALLOWED_ORIGINS");
        if (allowedOrigins != null && !allowedOrigins.isEmpty()) {
            // Split by comma and add each origin
            String[] origins = allowedOrigins.split(",");
            for (String origin : origins) {
                configuration.addAllowedOrigin(origin.trim());
            }
        } else {
            // Default: Allow common origins for development and production
            // Development origins
            configuration.addAllowedOrigin("http://localhost:5173");
            configuration.addAllowedOrigin("http://localhost:3000");
            configuration.addAllowedOrigin("http://localhost:8080");
            configuration.addAllowedOrigin("http://localhost:8082");
            
            // Production origins
            configuration.addAllowedOrigin("https://www.naviksha.co.in");
            configuration.addAllowedOrigin("https://naviksha.co.in");
            configuration.addAllowedOrigin("http://naviksha.co.in"); // HTTP fallback
            configuration.addAllowedOrigin("https://app.naviksha.co.in");
            configuration.addAllowedOrigin("http://app.naviksha.co.in");
            configuration.addAllowedOrigin("https://naviksha-frontend.onrender.com");
            configuration.addAllowedOrigin("https://acadspace-pathfinder.onrender.com");
        }
        
        configuration.addAllowedMethod("*"); // Allow all HTTP methods
        configuration.addAllowedHeader("*"); // Allow all headers
        configuration.setAllowCredentials(true); // Allow credentials (cookies, auth headers)
        configuration.setMaxAge(3600L); // Cache preflight for 1 hour
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exception -> exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // Public endpoints
                .requestMatchers("/error").permitAll() // Allow Spring Boot error handling for unauthenticated users
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Allow CORS preflight
                .requestMatchers("/api/auth/lookup").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/progress/{userId}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/progress/user/{userId}").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/tests/combined/submit").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/reports/*/report-link").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/reports/*/link").permitAll()
                .requestMatchers("/api/reports/demo/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/reports/user/**").permitAll()
                .requestMatchers("/health").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/admin/ui/**").permitAll() // Static admin UI
                
                // Admin endpoints require ADMIN role
                .requestMatchers("/admin/**").hasRole("ADMIN")
                
                // API endpoints require authentication
                .requestMatchers("/api/**").authenticated()
                
                // All other requests require authentication
                .anyRequest().authenticated()
            );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(adminSecretAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}