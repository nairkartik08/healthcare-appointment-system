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

    // ✅ Search doctors by specialization
    @GetMapping("/search")
    public List<Doctor> searchDoctors(@RequestParam(required = false) String specialty) {
        if (specialty == null || specialty.trim().isEmpty()) {
            return doctorRepository.findAll();
        }
        return doctorRepository.findBySpecializationIgnoreCase(specialty);
    }

    // ✅ Add doctor (THIS WAS BROKEN)
    @PostMapping("/add")
    public Doctor addDoctor(@RequestBody Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    @GetMapping("/user/{userId}")
    public Doctor getDoctorByUserId(@PathVariable Long userId) {
        Doctor doc = doctorRepository.findByUserId(userId).orElse(null);
        if (doc == null) {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                return doctorRepository.findAll().stream()
                        .filter(d -> auth.getName().equals(d.getEmail()))
                        .findFirst()
                        .orElse(null);
            }
        }
        return doc;
    }
}