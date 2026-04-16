package com.healthcare.healthcare_system.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long doctorId;

    @Column(nullable = false)
    private String campaignName;

    @Column(nullable = false)
    private String notificationTitle;

    @Column(nullable = false, length = 1000)
    private String message;

    private LocalDateTime createdAt = LocalDateTime.now();
}
