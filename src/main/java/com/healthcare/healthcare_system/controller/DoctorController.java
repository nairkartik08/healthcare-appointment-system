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
    private final com.healthcare.healthcare_system.repository.CampaignRepository campaignRepository;
    private final com.healthcare.healthcare_system.repository.PatientNotificationRepository patientNotificationRepository;

    public DoctorController(DoctorRepository doctorRepository,
                            com.healthcare.healthcare_system.repository.CampaignRepository campaignRepository,
                            com.healthcare.healthcare_system.repository.PatientNotificationRepository patientNotificationRepository) {
        this.doctorRepository = doctorRepository;
        this.campaignRepository = campaignRepository;
        this.patientNotificationRepository = patientNotificationRepository;
    }

    @PostMapping("/campaign/create/{doctorId}")
    public org.springframework.http.ResponseEntity<?> createCampaign(
            @PathVariable Long doctorId,
            @RequestBody com.healthcare.healthcare_system.dto.CampaignRequest req) {

        com.healthcare.healthcare_system.model.Campaign campaign = new com.healthcare.healthcare_system.model.Campaign();
        campaign.setDoctorId(doctorId);
        campaign.setCampaignName(req.getCampaignName());
        campaign.setNotificationTitle(req.getNotificationTitle());
        campaign.setMessage(req.getMessage());
        campaignRepository.save(campaign);

        if (req.getPatientIds() != null) {
            for (Long pid : req.getPatientIds()) {
                com.healthcare.healthcare_system.model.PatientNotification pn = new com.healthcare.healthcare_system.model.PatientNotification();
                pn.setPatientId(pid);
                pn.setCampaignId(campaign.getId());
                pn.setTitle(req.getNotificationTitle());
                pn.setMessage(req.getMessage());
                pn.setIsRead(false);
                patientNotificationRepository.save(pn);
            }
        }
        return org.springframework.http.ResponseEntity.ok("Campaign created and notifications sent.");
    }

    @GetMapping("/campaign/history/{doctorId}")
    public org.springframework.http.ResponseEntity<?> getCampaignHistory(@PathVariable Long doctorId) {
        List<com.healthcare.healthcare_system.model.Campaign> history = campaignRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
        return org.springframework.http.ResponseEntity.ok(history);
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