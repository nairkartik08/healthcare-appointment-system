package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.dto.DoctorWorkloadDTO;
import com.healthcare.healthcare_system.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {

    private final AppointmentRepository appointmentRepository;
    private final com.healthcare.healthcare_system.repository.DoctorRepository doctorRepository;
    private final com.healthcare.healthcare_system.repository.UserRepository userRepository;

    public AdminServiceImpl(AppointmentRepository appointmentRepository,
                            com.healthcare.healthcare_system.repository.DoctorRepository doctorRepository,
                            com.healthcare.healthcare_system.repository.UserRepository userRepository) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<DoctorWorkloadDTO> getDoctorWorkload() {
        return appointmentRepository.getDoctorWorkload();
    }

    @Override
    public java.util.List<java.util.Map<String, Object>> getAllDoctorsWithStatus() {
        java.util.List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        List<com.healthcare.healthcare_system.model.Doctor> doctors = doctorRepository.findAll();
        for (com.healthcare.healthcare_system.model.Doctor doctor : doctors) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("doctor", doctor);
            
            if (doctor.getUserId() != null) {
                com.healthcare.healthcare_system.model.User user = userRepository.findById(doctor.getUserId()).orElse(null);
                map.put("approvalStatus", user != null ? user.getApprovalStatus() : "UNKNOWN");
            } else {
                map.put("approvalStatus", "APPROVED"); // Seeded legacy doctors
            }
            result.add(map);
        }
        return result;
    }

    @Override
    public void updateDoctorStatus(Long doctorId, String status) {
        com.healthcare.healthcare_system.model.Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
                
        com.healthcare.healthcare_system.model.User user = userRepository.findById(doctor.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found for doctor"));
                
        user.setApprovalStatus(status);
        userRepository.save(user);
    }
}
