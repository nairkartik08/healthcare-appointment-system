package com.healthcare.healthcare_system.repository;
import java.util.Optional;
import com.healthcare.healthcare_system.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findByPatientId(Long patientId);
    Optional<Invoice> findByAppointmentId(Long appointmentId);
    @Query("SELECT COALESCE(SUM(i.amount),0) FROM Invoice i WHERE i.status='PAID'")
    Double getTotalRevenue();
}