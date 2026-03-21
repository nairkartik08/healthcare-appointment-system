package com.healthcare.healthcare_system.controller;

import com.healthcare.healthcare_system.model.MedicalRecord;
import com.healthcare.healthcare_system.service.MedicalRecordService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/doctor")
public class DoctorController {

    private final MedicalRecordService medicalRecordService;

    public DoctorController(MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }

    @PostMapping("/diagnosis/{appointmentId}")
    public MedicalRecord addDiagnosis(@PathVariable Long appointmentId,
                                      @RequestBody MedicalRecord record) {

        return medicalRecordService.addDiagnosis(appointmentId, record);
    }
}