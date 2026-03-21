package com.healthcare.healthcare_system.controller;

import com.healthcare.healthcare_system.model.Prescription;
import com.healthcare.healthcare_system.service.PrescriptionService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @PostMapping("/add/{appointmentId}")
    public Prescription addPrescription(@PathVariable Long appointmentId,
                                        @RequestBody Prescription prescription) {

        return prescriptionService.addPrescription(appointmentId, prescription);
    }

    @GetMapping("/patient/{patientId}")
    public List<Prescription> getPatientPrescriptions(@PathVariable Long patientId) {

        return prescriptionService.getPatientPrescriptions(patientId);
    }
}