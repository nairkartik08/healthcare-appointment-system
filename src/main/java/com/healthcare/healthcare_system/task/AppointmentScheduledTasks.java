package com.healthcare.healthcare_system.task;

import com.healthcare.healthcare_system.model.Appointment;
import com.healthcare.healthcare_system.model.AppointmentStatus;
import com.healthcare.healthcare_system.repository.AppointmentRepository;
import com.healthcare.healthcare_system.repository.InvoiceRepository;
import com.healthcare.healthcare_system.service.EmailService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AppointmentScheduledTasks {

    private final AppointmentRepository appointmentRepository;
    private final InvoiceRepository invoiceRepository;
    private final EmailService emailService;

    public AppointmentScheduledTasks(AppointmentRepository appointmentRepository,
                                   InvoiceRepository invoiceRepository,
                                   EmailService emailService) {
        this.appointmentRepository = appointmentRepository;
        this.invoiceRepository = invoiceRepository;
        this.emailService = emailService;
    }

    /**
     * Runs every 5 minutes to expire appointments that have passed 1 hour grace period.
     */
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void expireOldAppointments() {
        LocalDateTime now = LocalDateTime.now();
        List<Appointment> bookedAppointments = appointmentRepository.findAll().stream()
                .filter(app -> app.getStatus() == AppointmentStatus.BOOKED && app.getSlot() != null)
                .toList();

        for (Appointment app : bookedAppointments) {
            if (app.getSlot().getStartTime().plusHours(1).isBefore(now)) {
                String mode = app.getPaymentMode() != null ? app.getPaymentMode().toUpperCase() : "";
                
                if (mode.contains("CARD") || mode.contains("UPI")) {
                    app.setStatus(AppointmentStatus.EXPIRED_REFUNDED);
                    invoiceRepository.findByAppointmentId(app.getId()).ifPresent(inv -> {
                        inv.setStatus("REFUNDED");
                        invoiceRepository.save(inv);
                    });
                } else {
                    app.setStatus(AppointmentStatus.EXPIRED);
                    invoiceRepository.findByAppointmentId(app.getId()).ifPresent(inv -> {
                        inv.setStatus("CANCELLED");
                        invoiceRepository.save(inv);
                    });
                }
                
                if (app.getSlot() != null) {
                    app.getSlot().setBooked(false);
                }
                
                appointmentRepository.save(app);
            }
        }
    }

    /**
     * Runs every 10 minutes to send reminders to patients 1 hour before their appointment.
     */
    @Scheduled(fixedRate = 600000)
    @Transactional
    public void sendAppointmentReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourFromNow = now.plusHours(1);
        
        List<Appointment> upcoming = appointmentRepository.findAll().stream()
                .filter(app -> app.getStatus() == AppointmentStatus.BOOKED 
                        && app.getSlot() != null 
                        && !Boolean.TRUE.equals(app.getReminderSent()))
                .toList();

        for (Appointment app : upcoming) {
            LocalDateTime startTime = app.getSlot().getStartTime();
            
            // If appointment is within the next 70 minutes
            if (startTime.isAfter(now) && startTime.isBefore(oneHourFromNow.plusMinutes(10))) {
                if (app.getPatient() != null && app.getPatient().getEmail() != null) {
                    emailService.sendAppointmentReminderToPatient(
                        app.getPatient().getEmail(),
                        app.getPatient().getName(),
                        app.getDoctor() != null ? app.getDoctor().getName() : "Doctor",
                        startTime.toString()
                    );
                    app.setReminderSent(true);
                    appointmentRepository.save(app);
                }
            }
        }
    }
}
