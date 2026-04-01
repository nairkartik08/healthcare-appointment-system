package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.model.*;
import com.healthcare.healthcare_system.repository.*;

import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.List;

@Service
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final AppointmentRepository appointmentRepository;

    public InvoiceServiceImpl(InvoiceRepository invoiceRepository,
                              AppointmentRepository appointmentRepository) {
        this.invoiceRepository = invoiceRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public Invoice generateInvoice(Long appointmentId) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow();

        // Check if invoice already exists
        Optional<Invoice> existingInvoice = invoiceRepository.findByAppointmentId(appointmentId);

        if(existingInvoice.isPresent()) {
            return existingInvoice.get();
        }

        Invoice invoice = new Invoice();
        invoice.setAppointment(appointment);
        invoice.setDoctor(appointment.getDoctor());
        invoice.setPatient(appointment.getPatient());
        invoice.setAmount(appointment.getDoctor().getConsultationFee());
        
        // Auto-mark as PAID if paid online during booking
        String mode = appointment.getPaymentMode();
        if ("UPI".equalsIgnoreCase(mode) || "CARD".equalsIgnoreCase(mode) || "CARDS".equalsIgnoreCase(mode)) {
            invoice.setStatus("PAID");
        } else {
            invoice.setStatus("UNPAID");
        }

        return invoiceRepository.save(invoice);
    }

    @Override
    public List<Invoice> getPatientInvoices(Long patientId) {

        return invoiceRepository.findByPatientId(patientId);
    }

    @Override
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }
}
