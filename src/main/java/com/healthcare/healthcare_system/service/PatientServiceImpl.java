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
    @org.springframework.transaction.annotation.Transactional
    public Patient updatePatient(Long id, Patient patient) {

        Patient existing = patientRepository.findById(id).orElseThrow();

        if(patient.getName() != null && !patient.getName().trim().isEmpty()) existing.setName(patient.getName());
        // age removed from UI but keeping for compatibility if it's there
        if(patient.getAge() > 0) existing.setAge(patient.getAge());
        
        // Don't update email if we don't want to change login, but if they provide, could update
        if(patient.getEmail() != null && !patient.getEmail().trim().isEmpty()) existing.setEmail(patient.getEmail());
        
        if(patient.getMobileNo() != null) existing.setMobileNo(patient.getMobileNo());
        if(patient.getGender() != null) existing.setGender(patient.getGender());
        if(patient.getDob() != null) existing.setDob(patient.getDob());
        if(patient.getBloodGroup() != null) existing.setBloodGroup(patient.getBloodGroup());
        if(patient.getAddress() != null) existing.setAddress(patient.getAddress());
        if(patient.getEmergencyContact() != null) existing.setEmergencyContact(patient.getEmergencyContact());
        if(patient.getExistingDiseases() != null) existing.setExistingDiseases(patient.getExistingDiseases());
        if(patient.getInsuranceProvider() != null) existing.setInsuranceProvider(patient.getInsuranceProvider());

        return patientRepository.save(existing);
    }
}