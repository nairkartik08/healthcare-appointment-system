package com.healthcare.healthcare_system.controller;

import com.healthcare.healthcare_system.model.Role;
import com.healthcare.healthcare_system.dto.RegisterRequest;
import com.healthcare.healthcare_system.dto.LoginRequest;
import com.healthcare.healthcare_system.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.http.ResponseEntity;
import com.healthcare.healthcare_system.dto.LoginResponse;
import com.healthcare.healthcare_system.security.JwtUtil;
import com.healthcare.healthcare_system.repository.UserRepository;
import com.healthcare.healthcare_system.model.User;


@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public AuthController(AuthService authService,
            AuthenticationManager authenticationManager,
            JwtUtil jwtUtil,
            UserRepository userRepository) {
        this.authService = authService;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {

        authService.register(request);

        return "User Registered Successfully";
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {

        System.out.println("\n🔥 [DEBUG] Login attempt received for username: '" + request.getUsername() + "'");
        System.out.println("🔥 [DEBUG] Password length entered: " + (request.getPassword() != null ? request.getPassword().length() : 0));

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()));
            
            SecurityContextHolder.getContext().setAuthentication(authentication);

            System.out.println("✅ [DEBUG] Authentication succeeded for: " + request.getUsername());
        } catch (org.springframework.security.core.AuthenticationException e) {
            System.out.println("❌ [DEBUG] Authentication failed for: " + request.getUsername() + " | Error: " + e.getMessage());
            throw e;
        }

        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("UNKNOWN");

        String token = jwtUtil.generateToken(request.getUsername(), role);

        User user = userRepository.findByUsername(request.getUsername()).orElse(null);
        Long userId = user != null ? user.getId() : null;

        LoginResponse response = new LoginResponse(token, userId, request.getUsername(), role);
        return ResponseEntity.ok(response);
    }
}