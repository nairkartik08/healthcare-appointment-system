package com.healthcare.healthcare_system.repository;

import com.healthcare.healthcare_system.model.Clinic;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClinicRepository extends JpaRepository<Clinic, Long> {
}