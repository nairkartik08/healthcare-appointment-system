package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.dto.DoctorWorkloadDTO;
import java.util.List;

public interface AdminService {

    List<DoctorWorkloadDTO> getDoctorWorkload();
    
    java.util.List<java.util.Map<String, Object>> getAllDoctorsWithStatus();
    
    void updateDoctorStatus(Long doctorId, String status);

}