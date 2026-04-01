package com.healthcare.healthcare_system.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String specialization;

    private Double consultationFee;

    @Column(name = "experience_years")
    private Integer experienceYears;

    private String email;
    
    @Column(name = "mobile_no")
    private String mobileNo;
    
    private String gender;
    
    private String qualification;
    
    @Column(name = "license_number")
    private String licenseNumber;
    
    @Column(name = "available_days")
    private String availableDays;
    
    @Column(name = "available_time_slots")
    private String availableTimeSlots;
    
    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;
    
    @Column(name = "hospital_name")
    private String hospitalName;
    
    @Column(name = "clinic_address")
    private String clinicAddress;

    private Double rating;

    @ManyToOne
    @JoinColumn(name = "clinic_id")
    private Clinic clinic;

    @Column(name = "user_id", unique = true)
    private Long userId;
}