package com.healthcare.healthcare_system.repository;

import com.healthcare.healthcare_system.model.PatientNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PatientNotificationRepository extends JpaRepository<PatientNotification, Long> {
    List<PatientNotification> findByPatientIdOrderByCreatedAtDesc(Long patientId);
}
