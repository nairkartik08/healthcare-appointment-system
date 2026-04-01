package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.model.Patient;
import com.healthcare.healthcare_system.repository.PatientRepository;
import org.springframework.stereotype.Service;
import com.healthcare.healthcare_system.exception.ResourceNotFoundException;

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
        return patientRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Patient not found"));
    }

    @Override
    public Patient getPatientByUserId(Long userId) {
        return patientRepository.findByUserId(userId).orElseThrow(
                () -> new ResourceNotFoundException("Patient not found for this user"));
    }

    @Override
    public java.util.List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @Override
    public Patient updatePatient(Long id, Patient patient) {

        Patient existing = patientRepository.findById(id).orElseThrow();

        existing.setName(patient.getName());
        // age removed from UI but keeping for compatibility if it's there
        if(patient.getAge() > 0) existing.setAge(patient.getAge());
        
        // Don't update email if we don't want to change login, but if they provide, could update
        if(patient.getEmail() != null) existing.setEmail(patient.getEmail());
        
        existing.setMobileNo(patient.getMobileNo());
        existing.setGender(patient.getGender());
        existing.setDob(patient.getDob());
        existing.setBloodGroup(patient.getBloodGroup());
        existing.setAddress(patient.getAddress());
        existing.setEmergencyContact(patient.getEmergencyContact());
        existing.setExistingDiseases(patient.getExistingDiseases());
        existing.setInsuranceProvider(patient.getInsuranceProvider());

        return patientRepository.save(existing);
    }
}