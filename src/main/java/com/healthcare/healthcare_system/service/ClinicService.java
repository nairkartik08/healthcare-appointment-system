package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.model.Clinic;
import java.util.List;

public interface ClinicService {

    Clinic addClinic(Clinic clinic);

    List<Clinic> getAllClinics();

    Clinic getClinicById(Long id);

    Clinic getClinicByUserId(Long userId);
}