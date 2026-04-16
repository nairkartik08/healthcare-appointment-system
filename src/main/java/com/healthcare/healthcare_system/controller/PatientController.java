package com.healthcare.healthcare_system.controller;

import com.healthcare.healthcare_system.model.Doctor;
import com.healthcare.healthcare_system.model.Slot;
import com.healthcare.healthcare_system.model.Appointment;
import com.healthcare.healthcare_system.model.Patient;
import com.healthcare.healthcare_system.service.PatientService;

import com.healthcare.healthcare_system.service.DoctorService;
import com.healthcare.healthcare_system.service.SlotService;
import com.healthcare.healthcare_system.service.AppointmentService;
import com.healthcare.healthcare_system.model.MedicalRecord;
import com.healthcare.healthcare_system.service.MedicalRecordService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/patient")
public class PatientController {

    private final DoctorService doctorService;
    private final SlotService slotService;
    private final AppointmentService appointmentService;
    private final PatientService patientService;
    private final MedicalRecordService medicalRecordService;
    public PatientController(DoctorService doctorService,
                             SlotService slotService,
                             AppointmentService appointmentService,
                             PatientService patientService,
                             MedicalRecordService medicalRecordService) {

        this.doctorService = doctorService;
        this.slotService = slotService;
        this.appointmentService = appointmentService;
        this.patientService = patientService;
        this.medicalRecordService = medicalRecordService;
    }
    @GetMapping("/doctors")
    public List<Doctor> getDoctors() {
        return doctorService.getAllDoctors();
    }

    @GetMapping("/slots/{doctorId}")
    public List<Slot> getSlots(@PathVariable Long doctorId) {
        return slotService.getSlotsByDoctor(doctorId);
    }

    @PostMapping("/book")
    public Appointment bookAppointment(@RequestParam Long patientId,
                                       @RequestParam Long doctorId,
                                       @RequestParam Long slotId,
                                       @RequestParam(required = false) String name,
                                       @RequestParam(required = false) Integer age,
                                       @RequestParam(required = false) String mobileNo,
                                       @RequestParam(required = false) String paymentMode) {

        return appointmentService.bookAppointment(patientId, doctorId, slotId, name, age, mobileNo, paymentMode);
    }

    @PostMapping("/add")
    public Patient addPatient(@RequestBody Patient patient) {
        return patientService.addPatient(patient);
    }

    @GetMapping("/appointments/{patientId}")
    public List<Appointment> getPatientAppointments(@PathVariable Long patientId) {

        return appointmentService.getAppointmentsByPatient(patientId);
    }

    @PutMapping("/cancel/{appointmentId}")
    public Appointment cancelAppointment(@PathVariable Long appointmentId) {

        return appointmentService.cancelAppointment(appointmentId);
    }

    @GetMapping("/profile/{id}")
    public Patient getPatient(@PathVariable Long id) {
        return patientService.getPatient(id);
    }

    @PutMapping("/update/{id}")
    public Patient updatePatient(@PathVariable Long id,
                                 @RequestBody Patient patient) {
        return patientService.updatePatient(id, patient);
    }

    @PutMapping("/reschedule/{appointmentId}")
    public Appointment rescheduleAppointment(@PathVariable Long appointmentId,
                                             @RequestParam Long newSlotId) {

        return appointmentService.rescheduleAppointment(appointmentId, newSlotId);
    }

    @GetMapping("/records/{patientId}")
    public List<MedicalRecord> getRecords(@PathVariable Long patientId) {
        return medicalRecordService.getPatientRecords(patientId);
    }

    @PutMapping("/complete/{appointmentId}")
    public Appointment completeAppointment(@PathVariable Long appointmentId) {

        return appointmentService.completeAppointment(appointmentId);

    }

    @GetMapping("/user/{userId}")
    public Patient getPatientByUserId(@PathVariable Long userId) {
        try {
            return patientService.getPatientByUserId(userId);
        } catch (com.healthcare.healthcare_system.exception.ResourceNotFoundException e) {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                 // Try to fallback if the UI cache passed an old userId but the token is valid
                 try {
                     return patientService.getAllPatients().stream()
                             .filter(p -> auth.getName().equals(p.getEmail()) || auth.getName().equals(p.getName()))
                             .findFirst()
                             .orElseThrow(() -> e);
                 } catch (Exception fallbackEx) {
                     throw e;
                 }
            }
            throw e;
        }
    }

    @GetMapping("/all")
    public List<Patient> getAllPatients() {
        return patientService.getAllPatients();
    }
}