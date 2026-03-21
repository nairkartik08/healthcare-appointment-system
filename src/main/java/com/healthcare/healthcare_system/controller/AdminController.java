package com.healthcare.healthcare_system.controller;

import com.healthcare.healthcare_system.dto.DoctorWorkloadDTO;
import com.healthcare.healthcare_system.service.AdminService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/doctor-workload")
    public List<DoctorWorkloadDTO> doctorWorkload(){

        return adminService.getDoctorWorkload();

    }
}