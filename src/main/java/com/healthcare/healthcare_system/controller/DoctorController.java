package com.healthcare.healthcare_system.controller;

import com.healthcare.healthcare_system.model.Doctor;
import com.healthcare.healthcare_system.repository.DoctorRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctor")
@CrossOrigin(origins = "*")
public class DoctorController {

    private final DoctorRepository doctorRepository;

    public DoctorController(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    // ✅ Get all doctors (optional duplicate endpoint)
    @GetMapping("/doctors")
    public List<Doctor> getDoctors() {
        return doctorRepository.findAll();
    }

    // ✅ Get all doctors (main endpoint)
    @GetMapping("/all")
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    // ✅ Add doctor (THIS WAS BROKEN)
    @PostMapping("/add")
    public Doctor addDoctor(@RequestBody Doctor doctor) {
        return doctorRepository.save(doctor);
    }
}