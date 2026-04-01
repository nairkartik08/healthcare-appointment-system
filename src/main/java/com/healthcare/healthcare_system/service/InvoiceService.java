package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.model.Invoice;

import java.util.List;

public interface InvoiceService {

    Invoice generateInvoice(Long appointmentId);

    List<Invoice> getPatientInvoices(Long patientId);

    List<Invoice> getAllInvoices();

}