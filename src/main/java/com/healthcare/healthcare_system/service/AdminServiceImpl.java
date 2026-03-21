package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.dto.DoctorWorkloadDTO;
import com.healthcare.healthcare_system.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {

    private final AppointmentRepository appointmentRepository;

    public AdminServiceImpl(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public List<DoctorWorkloadDTO> getDoctorWorkload() {

        return appointmentRepository.getDoctorWorkload();

    }
}
