package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.model.*;
import com.healthcare.healthcare_system.repository.*;
import com.healthcare.healthcare_system.model.AppointmentStatus;
import com.healthcare.healthcare_system.model.Slot;
import com.healthcare.healthcare_system.model.AppointmentStatus;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final SlotRepository slotRepository;
    private final InvoiceService invoiceService;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository,
                                  PatientRepository patientRepository,
                                  DoctorRepository doctorRepository,
                                  SlotRepository slotRepository,
                                  InvoiceService invoiceService) {

        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.slotRepository = slotRepository;
        this.invoiceService = invoiceService;
    }

    @Override
    public Appointment bookAppointment(Long patientId,
                                       Long doctorId,
                                       Long slotId) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow();

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow();

        Slot slot = slotRepository.findById(slotId)
                .orElseThrow();

        if (slot.getBooked()) {
            throw new RuntimeException("Slot already booked");
        }

        slot.setBooked(true);
        slotRepository.save(slot);

        Appointment appointment = new Appointment();

        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setSlot(slot);
        appointment.setStatus(AppointmentStatus.BOOKED);

        return appointmentRepository.save(appointment);
    }

    @Override
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @Override
    public List<Appointment> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    @Override
    public Appointment cancelAppointment(Long id) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setStatus(AppointmentStatus.CANCELLED);

        Slot slot = appointment.getSlot();
        slot.setBooked(false);

        slotRepository.save(slot);

        return appointmentRepository.save(appointment);
    }

    @Override
    public List<Appointment> getDoctorAppointments(Long doctorId) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow();

        return appointmentRepository.findByDoctor(doctor);
    }

    @Override
    public Appointment rescheduleAppointment(Long appointmentId, Long newSlotId) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Slot oldSlot = appointment.getSlot();
        oldSlot.setBooked(false);
        slotRepository.save(oldSlot);

        Slot newSlot = slotRepository.findById(newSlotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (newSlot.getBooked()) {
            throw new RuntimeException("Slot already booked");
        }

        newSlot.setBooked(true);
        slotRepository.save(newSlot);

        appointment.setSlot(newSlot);
        appointment.setStatus(AppointmentStatus.RESCHEDULED);

        return appointmentRepository.save(appointment);
    }

    @Override
    public Appointment completeAppointment(Long appointmentId) {

        Appointment appointment = appointmentRepository
                .findById(appointmentId)
                .orElseThrow();

        appointment.setStatus(AppointmentStatus.COMPLETED);

        appointmentRepository.save(appointment);

        invoiceService.generateInvoice(appointmentId);

        return appointment;
    }
}