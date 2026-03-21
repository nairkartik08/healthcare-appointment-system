package com.healthcare.healthcare_system.controller;

import com.healthcare.healthcare_system.model.Payment;
import com.healthcare.healthcare_system.service.PaymentService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService){
        this.paymentService = paymentService;
    }

    @PostMapping("/pay/{invoiceId}")
    public Payment payInvoice(@PathVariable Long invoiceId,
                              @RequestParam String method){

        return paymentService.payInvoice(invoiceId,method);
    }

    @GetMapping("/patient/{patientId}")
    public List<Payment> getPayments(@PathVariable Long patientId){

        return paymentService.getPatientPayments(patientId);
    }
}
