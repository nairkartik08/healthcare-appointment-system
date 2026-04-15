package com.healthcare.healthcare_system.controller;

import com.healthcare.healthcare_system.model.Doctor;
import com.healthcare.healthcare_system.model.Slot;
import com.healthcare.healthcare_system.service.DoctorService;
import com.healthcare.healthcare_system.service.SlotService;
import com.healthcare.healthcare_system.model.Appointment;
import com.healthcare.healthcare_system.service.AppointmentService;
import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.healthcare.healthcare_system.service.ClinicService;
import com.healthcare.healthcare_system.model.Clinic;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/clinic")
public class ClinicController {

    private final DoctorService doctorService;
    private final SlotService slotService;
    private final AppointmentService appointmentService;
    private final ClinicService clinicService;

    public ClinicController(DoctorService doctorService,
            SlotService slotService,
            AppointmentService appointmentService,
            ClinicService clinicService) {
        this.doctorService = doctorService;
        this.slotService = slotService;
        this.appointmentService = appointmentService;
        this.clinicService = clinicService;
    }

    @PostMapping("/add-doctor")
    public Doctor addDoctor(@RequestBody Doctor doctor) {
        return doctorService.addDoctor(doctor);
    }

    @PostMapping("/create-slot/{doctorId}")
    public Slot createSlot(@PathVariable Long doctorId,
            @RequestBody Slot slot) {

        return slotService.createSlot(doctorId, slot);
    }

    @GetMapping("/appointments")
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    @GetMapping("/user/{userId}")
    public Clinic getClinicByUserId(@PathVariable Long userId) {
        return clinicService.getClinicByUserId(userId);
    }
}