package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.model.*;
import com.healthcare.healthcare_system.repository.*;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrescriptionServiceImpl implements PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;

    public PrescriptionServiceImpl(PrescriptionRepository prescriptionRepository,
                                   AppointmentRepository appointmentRepository) {

        this.prescriptionRepository = prescriptionRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public Prescription addPrescription(Long appointmentId, Prescription prescription) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow();

        prescription.setAppointment(appointment);
        prescription.setPatient(appointment.getPatient());
        prescription.setDoctor(appointment.getDoctor());

        return prescriptionRepository.save(prescription);
    }

    @Override
    public List<Prescription> getPatientPrescriptions(Long patientId) {
        return prescriptionRepository.findByPatientId(patientId);
    }
}