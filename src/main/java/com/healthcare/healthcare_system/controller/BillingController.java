package com.healthcare.healthcare_system.controller;

import com.healthcare.healthcare_system.model.Invoice;
import com.healthcare.healthcare_system.service.InvoiceService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/billing")
public class BillingController {

    private final InvoiceService invoiceService;

    public BillingController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PostMapping("/generate/{appointmentId}")
    public Invoice generateInvoice(@PathVariable Long appointmentId) {

        return invoiceService.generateInvoice(appointmentId);
    }

    @GetMapping("/patient/{patientId}")
    public List<Invoice> getInvoices(@PathVariable Long patientId) {

        return invoiceService.getPatientInvoices(patientId);
    }
}