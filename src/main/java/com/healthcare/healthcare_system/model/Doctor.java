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

    private double consultationFee;

    @ManyToOne
    @JoinColumn(name = "clinic_id")
    private Clinic clinic;
}