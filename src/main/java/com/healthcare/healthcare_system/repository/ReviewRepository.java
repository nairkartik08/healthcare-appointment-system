package com.healthcare.healthcare_system.repository;

import com.healthcare.healthcare_system.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);
    boolean existsByPatientIdAndDoctorId(Long patientId, Long doctorId);

    @Query("SELECT r.doctor.id FROM Review r WHERE r.patient.id = :patientId")
    List<Long> findDoctorIdsByPatientId(@Param("patientId") Long patientId);
}
