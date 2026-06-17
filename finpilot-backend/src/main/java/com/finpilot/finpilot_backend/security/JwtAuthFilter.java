package com.finpilot.finpilot_backend.security;

import com.finpilot.finpilot_backend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        log.info("JWT filter called for URI: {}", request.getRequestURI());
        String authHeader = request.getHeader("Authorization");
        log.info("Authorization header: {}", authHeader);
        String token = null;
        String email = null;
        boolean tokenRejected = false;
        String rejectionReason = null;

        log.info("Request to: {} {}", request.getMethod(), request.getRequestURI());
        log.info("Auth header present: {}", authHeader != null);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);

            log.info("Token extracted, length: {}", token.length());
            try {
                email = jwtUtil.extractEmail(token);
                log.info("Email extracted from token: {}", email);
            } catch (Exception e) {
                log.error("Error extracting email from token: {}", e.getMessage());
                tokenRejected = true;
                rejectionReason = "Invalid or expired token";
            }
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            String emailFinal = email;
            var userDetails = userRepository.findByEmail(emailFinal)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + emailFinal));

            try {
                if (jwtUtil.isTokenValid(token)) {
                    log.info("Token is valid, setting authentication");

                    var authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContext context = SecurityContextHolder.createEmptyContext();
                    context.setAuthentication(authToken);
                    SecurityContextHolder.setContext(context);
                }

                else {
                    log.warn("Token is NOT valid");
                    tokenRejected = true;
                    rejectionReason = "Invalid or expired token";
                }

            } catch (Exception e) {
                log.error("Error validating token: {}", e.getMessage());
                tokenRejected = true;
                rejectionReason = "Invalid or expired token";
            }
        }

        if (tokenRejected) {
            writeUnauthorized(response, rejectionReason);
            return;
        }

        filterChain.doFilter(request, response);

        log.info("Final auth state: {}", SecurityContextHolder.getContext().getAuthentication());
    }

    private void writeUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader(HttpHeaders.WWW_AUTHENTICATE, "Bearer error=\"invalid_token\"");
        response.getWriter().write(objectMapper.writeValueAsString(Map.of(
                "message", message,
                "status", 401)));
    }

}
