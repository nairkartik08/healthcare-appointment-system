package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.model.Appointment;
import java.util.List;

public interface AppointmentService {

    Appointment bookAppointment(Long patientId, Long doctorId, Long slotId);

    List<Appointment> getAllAppointments();

    List<Appointment> getAppointmentsByPatient(Long patientId);

    List<Appointment> getDoctorAppointments(Long doctorId);
    Appointment cancelAppointment(Long id);
    Appointment rescheduleAppointment(Long appointmentId, Long newSlotId);
    Appointment completeAppointment(Long appointmentId);
}