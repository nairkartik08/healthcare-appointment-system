package com.healthcare.healthcare_system.component;

import com.healthcare.healthcare_system.model.Appointment;
import com.healthcare.healthcare_system.model.AppointmentStatus;
import com.healthcare.healthcare_system.model.PatientNotification;
import com.healthcare.healthcare_system.repository.AppointmentRepository;
import com.healthcare.healthcare_system.repository.PatientNotificationRepository;
import com.healthcare.healthcare_system.service.EmailService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class NotificationScheduler {

    private final AppointmentRepository appointmentRepository;
    private final PatientNotificationRepository patientNotificationRepository;
    private final EmailService emailService;

    public NotificationScheduler(AppointmentRepository appointmentRepository,
                                 PatientNotificationRepository patientNotificationRepository,
                                 EmailService emailService) {
        this.appointmentRepository = appointmentRepository;
        this.patientNotificationRepository = patientNotificationRepository;
        this.emailService = emailService;
    }

    @Scheduled(fixedRate = 60000) // Runs every minute
    public void sendAppointmentReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourFromNow = now.plusHours(1);

        List<Appointment> bookedAppointments = appointmentRepository.findAll();

        for (Appointment appointment : bookedAppointments) {
            if (appointment.getStatus() == AppointmentStatus.BOOKED 
                && appointment.getSlot() != null 
                && (appointment.getReminderSent() == null || !appointment.getReminderSent())) {
                
                LocalDateTime slotStartTime = appointment.getSlot().getStartTime();
                
                // If the appointment is within the next 60 minutes and hasn't started yet
                if (slotStartTime.isAfter(now) && slotStartTime.isBefore(oneHourFromNow)) {
                    
                    PatientNotification notification = new PatientNotification();
                    notification.setPatientId(appointment.getPatient().getId());
                    notification.setTitle("Upcoming Appointment Reminder");
                    
                    String timeFormatted = slotStartTime.format(DateTimeFormatter.ofPattern("hh:mm a"));
                    notification.setMessage("Your appointment with Dr. " + appointment.getDoctor().getName() + " is scheduled in less than an hour at " + timeFormatted + ".");
                    notification.setIsRead(false);
                    
                    patientNotificationRepository.save(notification);
                    
                    // Send Email to Patient
                    if (appointment.getPatient().getEmail() != null) {
                        emailService.sendAppointmentReminderToPatient(
                            appointment.getPatient().getEmail(),
                            appointment.getPatient().getName() != null ? appointment.getPatient().getName() : "Patient",
                            appointment.getDoctor().getName(),
                            timeFormatted
                        );
                    }
                    
                    appointment.setReminderSent(true);
                    appointmentRepository.save(appointment);
                }
            }
        }
    }
}
