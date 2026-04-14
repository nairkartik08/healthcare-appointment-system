package com.healthcare.healthcare_system.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    @Column(unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean isVerified = false;

    @Column(name = "otp_code")
    private String otpCode;

    @Column(name = "otp_expiry_time")
    private java.time.LocalDateTime otpExpiryTime;
}