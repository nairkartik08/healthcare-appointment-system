package com.healthcare.healthcare_system.controller;

import com.healthcare.healthcare_system.model.Doctor;
import com.healthcare.healthcare_system.model.Slot;
import com.healthcare.healthcare_system.service.DoctorService;
import com.healthcare.healthcare_system.service.SlotService;
import com.healthcare.healthcare_system.model.Appointment;
import com.healthcare.healthcare_system.service.AppointmentService;
import java.util.List;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/clinic")
public class ClinicController {

    private final DoctorService doctorService;
    private final SlotService slotService;
    private final AppointmentService appointmentService;

    public ClinicController(DoctorService doctorService,
            SlotService slotService,
            AppointmentService appointmentService) {
        this.doctorService = doctorService;
        this.slotService = slotService;
        this.appointmentService = appointmentService;
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

}