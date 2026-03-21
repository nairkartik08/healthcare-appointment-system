package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.model.Payment;
import java.util.List;

public interface PaymentService {

    Payment payInvoice(Long invoiceId,String method);

    List<Payment> getPatientPayments(Long patientId);

}