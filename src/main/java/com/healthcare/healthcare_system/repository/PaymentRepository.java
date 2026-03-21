package com.healthcare.healthcare_system.repository;

import com.healthcare.healthcare_system.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment,Long> {

    List<Payment> findByPatientId(Long patientId);

}