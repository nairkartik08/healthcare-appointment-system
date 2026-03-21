package com.healthcare.healthcare_system.repository;

import com.healthcare.healthcare_system.model.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    List<MedicalRecord> findByPatientId(Long patientId);
    List<MedicalRecord> findByPatientIdOrderByVisitDateDesc(Long patientId);
    Optional<MedicalRecord> findByAppointmentId(Long appointmentId);
}