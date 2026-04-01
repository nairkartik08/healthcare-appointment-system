package com.healthcare.healthcare_system.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name")
    private String fullName;

    private String email;

    private String department;

    @Column(name = "contact_number")
    private String contactNumber;

    @Column(name = "user_id", unique = true)
    private Long userId;
}
