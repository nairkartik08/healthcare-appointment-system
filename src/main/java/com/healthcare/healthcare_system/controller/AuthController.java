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
        System.out.println("\n--- 🟢 [LOGIN START] ---");
        System.out.println("👉 Attempting login for email: [" + request.getEmail() + "]");

        Authentication authentication;
        try {
            System.out.println("🔄 Step 1: AuthenticationManager.authenticate()...");
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            System.out.println("✅ Step 1: Authentication Successful");

        } catch (org.springframework.security.core.AuthenticationException e) {
            System.out.println("❌ Step 1: Authentication Failed | Message: " + e.getMessage());
            throw e;
        } catch (Throwable t) {
            System.err.println("🚨 CRITICAL ERROR during Step 1: " + t.getMessage());
            t.printStackTrace();
            throw new RuntimeException("Internal error during authentication: " + t.getMessage());
        }

        try {
            System.out.println("🔄 Step 2: Extracting Roles...");
            String role = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("UNKNOWN");
            System.out.println("✅ Step 2: Role detected: " + role);

            System.out.println("🔄 Step 3: Generating JWT Token...");
            String token = jwtUtil.generateToken(request.getEmail(), role);
            if (token == null) throw new RuntimeException("JWT generation returned null");
            System.out.println("✅ Step 3: Token generated");

            System.out.println("🔄 Step 4: Re-fetching user from DB for response metadata...");
            User user = userRepository.findByUsernameOrEmail(request.getEmail(), request.getEmail()).orElse(null);
            
            if (user == null) {
                System.out.println("❌ Step 4 Failed: User not found in DB after auth!");
                throw new RuntimeException("System error: Authenticated user not found in database.");
            }

            if ("PENDING_APPROVAL".equals(user.getApprovalStatus())) {
                System.out.println("❌ Step 4: Account PENDING_APPROVAL");
                throw new RuntimeException("Your account is pending admin approval. Please check back later.");
            }
            System.out.println("✅ Step 4: User verified and approved");
            
            Long userId = user.getId();
            String username = user.getUsername();

            System.out.println("🔄 Step 5: Preparing LoginResponse...");
            LoginResponse response = new LoginResponse(token, userId, username, role);
            System.out.println("🏁 [LOGIN SUCCESS] for: " + username);
            System.out.println("------------------------\n");
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("🚨 ERROR during Post-Auth steps: " + e.getMessage());
            e.printStackTrace();
            throw e;
        } catch (Throwable t) {
            System.err.println("🚨 CRITICAL SYSTEM ERROR during Post-Auth: " + t.getMessage());
            t.printStackTrace();
            throw new RuntimeException("Critical system error: " + t.getMessage());
        }
    }
}