package com.healthcare.healthcare_system.model;

import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;
    private int age;
    @Email
    private String email;

    @Column(name = "mobile_no")
    private String mobileNo;

    private String gender;
    private String dob;
    
    @Column(name = "blood_group")
    private String bloodGroup;
    
    private String address;
    
    @Column(name = "emergency_contact")
    private String emergencyContact;
    
    @Column(name = "existing_diseases")
    private String existingDiseases;
    
    @Column(name = "insurance_provider")
    private String insuranceProvider;

    @Column(name = "user_id", unique = true)
    private Long userId;
}