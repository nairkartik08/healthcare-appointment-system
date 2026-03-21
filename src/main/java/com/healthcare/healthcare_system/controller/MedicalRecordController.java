package com.healthcare.healthcare_system.controller;

import com.healthcare.healthcare_system.model.MedicalRecord;
import com.healthcare.healthcare_system.service.MedicalRecordService;
import com.healthcare.healthcare_system.dto.VisitHistoryDTO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/records")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    public MedicalRecordController(MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }

    @PostMapping("/diagnosis/{appointmentId}")
    public MedicalRecord addDiagnosis(@PathVariable Long appointmentId,
                                      @RequestBody MedicalRecord record) {

        return medicalRecordService.addDiagnosis(appointmentId, record);
    }

    @GetMapping("/patient/{patientId}")
    public List<MedicalRecord> getPatientRecords(@PathVariable Long patientId) {

        return medicalRecordService.getPatientRecords(patientId);
    }

    @PutMapping("/update/{appointmentId}")
    public MedicalRecord updateRecord(@PathVariable Long appointmentId,
                                      @RequestBody MedicalRecord record) {

        return medicalRecordService.updateRecord(appointmentId, record);
    }

    @GetMapping("/timeline/{patientId}")
    public List<VisitHistoryDTO> getTimeline(@PathVariable Long patientId) {

        return medicalRecordService.getVisitHistory(patientId);

    }

}