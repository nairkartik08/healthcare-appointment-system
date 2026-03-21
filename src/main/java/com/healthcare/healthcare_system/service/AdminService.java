package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.dto.DoctorWorkloadDTO;
import java.util.List;

public interface AdminService {

    List<DoctorWorkloadDTO> getDoctorWorkload();

}