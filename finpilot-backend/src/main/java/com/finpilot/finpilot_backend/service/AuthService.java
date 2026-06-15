package com.finpilot.finpilot_backend.service;

import com.finpilot.finpilot_backend.dto.AuthResponse;
import com.finpilot.finpilot_backend.dto.LoginRequest;
import com.finpilot.finpilot_backend.dto.RegisterRequest;
import com.finpilot.finpilot_backend.model.User;
import com.finpilot.finpilot_backend.repository.UserRepository;
import com.finpilot.finpilot_backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        log.info("User logged in: {}", user.getEmail());

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token);
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user = userRepository.save(user);

        log.info("New user registered: {}", user.getEmail());

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token);
    }
}
