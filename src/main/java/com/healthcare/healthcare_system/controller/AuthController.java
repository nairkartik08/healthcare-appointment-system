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

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;

    public AuthController(AuthService authService,
            AuthenticationManager authenticationManager) {
        this.authService = authService;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {

        authService.register(
                request.getUsername(),
                request.getPassword(),
                Role.valueOf(request.getRole().toUpperCase()));

        return "User Registered Successfully";
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // return role
        return authentication.getAuthorities().toString();
    }

}