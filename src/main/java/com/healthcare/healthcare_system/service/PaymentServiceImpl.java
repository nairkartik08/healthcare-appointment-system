package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.model.*;
import com.healthcare.healthcare_system.repository.*;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepository,
                              InvoiceRepository invoiceRepository) {

        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
    }

    @Override
    public Payment payInvoice(Long invoiceId,String method){

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow();

        invoice.setStatus("PAID");
        invoiceRepository.save(invoice);

        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setPatient(invoice.getPatient());
        payment.setAmount(invoice.getAmount());
        payment.setMethod(method);
        payment.setStatus("SUCCESS");
        payment.setPaymentTime(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    @Override
    public List<Payment> getPatientPayments(Long patientId){
        return paymentRepository.findByPatientId(patientId);
    }
}
