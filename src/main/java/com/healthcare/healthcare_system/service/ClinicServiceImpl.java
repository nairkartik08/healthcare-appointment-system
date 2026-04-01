package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.model.Clinic;
import com.healthcare.healthcare_system.repository.ClinicRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ClinicServiceImpl implements ClinicService {

    private final ClinicRepository clinicRepository;

    public ClinicServiceImpl(ClinicRepository clinicRepository) {
        this.clinicRepository = clinicRepository;
    }

    @Override
    public Clinic addClinic(Clinic clinic) {
        return clinicRepository.save(clinic);
    }

    @Override
    public List<Clinic> getAllClinics() {
        return clinicRepository.findAll();
    }

    @Override
    public Clinic getClinicById(Long id) {
        return clinicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Clinic not found"));
    }

    @Override
    public Clinic getClinicByUserId(Long userId) {
        return clinicRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Clinic not found for this user"));
    }
}