package com.healthcare.healthcare_system.controller;

import com.healthcare.healthcare_system.model.Appointment;
import com.healthcare.healthcare_system.service.AppointmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping("/{patientId}/{doctorId}")
    public Appointment bookAppointment(@PathVariable Long patientId,
                                       @PathVariable Long doctorId,
                                       @RequestParam Long slotId,
                                       @RequestParam(required = false) String name,
                                       @RequestParam(required = false) Integer age,
                                       @RequestParam(required = false) String mobileNo,
                                       @RequestParam(required = false) String paymentMode) {
        return appointmentService.bookAppointment(patientId, doctorId, slotId, name, age, mobileNo, paymentMode);
    }

    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    @GetMapping("/doctor/{doctorId}")
    public List<Appointment> getDoctorAppointments(@PathVariable Long doctorId) {
        return appointmentService.getDoctorAppointments(doctorId);
    }

    @PutMapping("/cancel/{id}")
    public Appointment cancelAppointment(@PathVariable Long id) {
        return appointmentService.cancelAppointment(id);
    }
}