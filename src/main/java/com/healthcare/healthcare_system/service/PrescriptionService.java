package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.model.Prescription;
import java.util.List;

public interface PrescriptionService {

    Prescription addPrescription(Long appointmentId, Prescription prescription);

    List<Prescription> getPatientPrescriptions(Long patientId);

}