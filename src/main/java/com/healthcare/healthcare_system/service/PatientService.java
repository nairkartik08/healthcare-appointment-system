package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.model.Patient;

public interface PatientService {

    Patient addPatient(Patient patient);
    Patient updatePatient(Long id, Patient patient);
    Patient getPatient(Long id);
    Patient getPatientByUserId(Long userId);
    java.util.List<Patient> getAllPatients();
}