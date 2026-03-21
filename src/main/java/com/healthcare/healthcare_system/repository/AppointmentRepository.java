package com.healthcare.healthcare_system.repository;

import com.healthcare.healthcare_system.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import com.healthcare.healthcare_system.model.Doctor;
import org.springframework.data.jpa.repository.Query;
import com.healthcare.healthcare_system.dto.DoctorWorkloadDTO;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByDoctor(Doctor doctor);
    @Query(value = "SELECT COUNT(*) FROM appointment a JOIN slot s ON a.slot_id=s.id WHERE DATE(s.start_time)=CURRENT_DATE", nativeQuery = true)
    long countTodayAppointments();

    @Query("SELECT new com.healthcare.healthcare_system.dto.DoctorWorkloadDTO(a.doctor.id, a.doctor.name, COUNT(a)) " +
            "FROM Appointment a GROUP BY a.doctor.id, a.doctor.name")
    List<DoctorWorkloadDTO> getDoctorWorkload();

}