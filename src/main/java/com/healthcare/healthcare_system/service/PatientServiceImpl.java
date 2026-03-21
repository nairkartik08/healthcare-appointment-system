package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.model.Patient;
import com.healthcare.healthcare_system.repository.PatientRepository;
import org.springframework.stereotype.Service;

@Service
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    public PatientServiceImpl(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Override
    public Patient addPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    @Override
    public Patient getPatient(Long id) {
        return patientRepository.findById(id).orElseThrow();
    }

    @Override
    public Patient updatePatient(Long id, Patient patient) {

        Patient existing = patientRepository.findById(id).orElseThrow();

        existing.setName(patient.getName());
        existing.setAge(patient.getAge());
        existing.setEmail(patient.getEmail());

        return patientRepository.save(existing);
    }
}