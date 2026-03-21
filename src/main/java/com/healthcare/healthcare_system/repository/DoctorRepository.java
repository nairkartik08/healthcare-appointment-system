package com.healthcare.healthcare_system.repository;

import com.healthcare.healthcare_system.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
}