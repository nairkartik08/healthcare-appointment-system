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
    private final EmailService emailService;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository,
                                  PatientRepository patientRepository,
                                  DoctorRepository doctorRepository,
                                  SlotRepository slotRepository,
                                  InvoiceService invoiceService,
                                  EmailService emailService) {

        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.slotRepository = slotRepository;
        this.invoiceService = invoiceService;
        this.emailService = emailService;
    }

    @Override
    public Appointment bookAppointment(Long patientId,
                                       Long doctorId,
                                       Long slotId,
                                       String name,
                                       Integer age,
                                       String mobileNo,
                                       String paymentMode) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow();

        // Update patient profile if new info was provided
        boolean profileUpdated = false;
        if (name != null && !name.trim().isEmpty()) { patient.setName(name); profileUpdated = true; }
        if (age != null) { patient.setAge(age); profileUpdated = true; }
        if (mobileNo != null && !mobileNo.trim().isEmpty()) { patient.setMobileNo(mobileNo); profileUpdated = true; }
        
        if (profileUpdated) {
            patientRepository.save(patient);
        }

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
        appointment.setPaymentMode(paymentMode);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Simulated Automated Notification
        System.out.println("====== AUTOMATED NOTIFICATION ======");
        System.out.println("To: " + patient.getEmail());
        System.out.println("Subject: Appointment Confirmation");
        System.out.println("Your appointment with Dr. " + doctor.getName() + " is confirmed for " + slot.getStartTime());
        System.out.println("====================================");

        // Send Email to Doctor
        if (doctor.getEmail() != null) {
             emailService.sendAppointmentNotificationToDoctor(
                 doctor.getEmail(),
                 doctor.getName(),
                 patient.getName() != null ? patient.getName() : "Unknown Patient",
                 slot.getStartTime().toString()
             );
        }

        return savedAppointment;
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