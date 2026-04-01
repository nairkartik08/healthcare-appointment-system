package com.healthcare.healthcare_system.repository;

import com.healthcare.healthcare_system.model.Clinic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClinicRepository extends JpaRepository<Clinic, Long> {
    Optional<Clinic> findByUserId(Long userId);
}