package com.healthcare.healthcare_system.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime startTime;

    private Boolean booked = false;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;
}
