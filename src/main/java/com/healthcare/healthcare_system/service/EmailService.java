package com.healthcare.healthcare_system.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otp) {
        System.out.println("🔥 [DEBUG] Sending OTP " + otp + " to: " + toEmail);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Healthcare Portal - Please verify your email");
            message.setText("Welcome to Healthcare Portal!\n\nYour OTP code for registration is: " + otp + "\n\nThis code will expire in 10 minutes.\n\nThank you!");
            
            javaMailSender.send(message);
            System.out.println("✅ [DEBUG] OTP sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.out.println("❌ [DEBUG] Failed to send email to " + toEmail + ". Error: " + e.getMessage());
            // We usually wouldn't throw a generic runtime exception here but we want the developer to see the problem explicitly
            throw new RuntimeException("Could not send email. Please check your SMTP configuration.");
        }
    }
}
