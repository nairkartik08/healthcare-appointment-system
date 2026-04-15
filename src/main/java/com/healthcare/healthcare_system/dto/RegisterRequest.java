package com.healthcare.healthcare_system.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    private String username;
    private String password;
    private String role;
    
    // Shared
    private String fullName;
    private String email;
    private String mobileNumber;
    private String gender;

    // Patient
    private String dob;
    private String bloodGroup;
    private String address;
    private String emergencyContact;
    private String existingDiseases;
    private String insuranceProvider;

    // Doctor
    private String specialization;
    private String qualification;
    private Integer experienceYears;
    private String licenseNumber;
    private String hospitalName;
    private Double consultationFees;
    private String availableDays;
    private String availableTimeSlots;
    private String clinicAddress;
    private String profilePhotoUrl;
    
    // Document Uploads (Mock URLs/Paths)
    private String licenseCertificateUrl;
    private String degreeUrl;
    private String hospitalIdUrl;

    // Admin
    private String department;
    private String adminCode;
}