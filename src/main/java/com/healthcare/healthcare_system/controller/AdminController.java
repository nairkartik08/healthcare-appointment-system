package com.healthcare.healthcare_system.controller;

import com.healthcare.healthcare_system.dto.DoctorWorkloadDTO;
import com.healthcare.healthcare_system.service.AdminService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;
    private final com.healthcare.healthcare_system.repository.AdminRepository adminRepository;

    public AdminController(AdminService adminService, com.healthcare.healthcare_system.repository.AdminRepository adminRepository) {
        this.adminService = adminService;
        this.adminRepository = adminRepository;
    }

    @GetMapping("/doctor-workload")
    public List<DoctorWorkloadDTO> doctorWorkload(){

        return adminService.getDoctorWorkload();

    }

    @GetMapping("/user/{userId}")
    public com.healthcare.healthcare_system.model.Admin getAdminByUserId(@PathVariable Long userId) {
        return adminRepository.findByUserId(userId).orElse(null);
    }
}