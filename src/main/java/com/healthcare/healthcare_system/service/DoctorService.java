package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.model.Doctor;
import java.util.List;

public interface DoctorService {

    Doctor addDoctor(Doctor doctor);

    List<Doctor> getAllDoctors();
}