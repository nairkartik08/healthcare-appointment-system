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
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {

        authService.register(request);

        return ResponseEntity.ok("OTP sent to your email. Please verify.");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody com.healthcare.healthcare_system.dto.OtpVerificationRequest request) {
        try {
            String message = authService.verifyOtp(request);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {

        System.out.println("\n🔥 [DEBUG] Login attempt received for email: '" + request.getEmail() + "'");
        System.out.println("🔥 [DEBUG] Password length entered: " + (request.getPassword() != null ? request.getPassword().length() : 0));

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));
            
            SecurityContextHolder.getContext().setAuthentication(authentication);

            System.out.println("✅ [DEBUG] Authentication succeeded for: " + request.getEmail());
        } catch (org.springframework.security.core.AuthenticationException e) {
            System.out.println("❌ [DEBUG] Authentication failed for: " + request.getEmail() + " | Error: " + e.getMessage());
            throw e;
        }

        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("UNKNOWN");

        String token = jwtUtil.generateToken(request.getEmail(), role);

        User user = userRepository.findByUsernameOrEmail(request.getEmail(), request.getEmail()).orElse(null);
        
        if (user == null) {
            throw new RuntimeException("User data could not be retrieved. Please contact support.");
        }

        if ("PENDING_APPROVAL".equals(user.getApprovalStatus())) {
            throw new RuntimeException("Your account is pending admin approval. Please check back later.");
        }
        
        Long userId = user.getId();
        String username = user.getUsername();

        LoginResponse response = new LoginResponse(token, userId, username, role);
        return ResponseEntity.ok(response);
    }
}