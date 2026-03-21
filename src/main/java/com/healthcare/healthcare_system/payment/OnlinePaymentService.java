package com.healthcare.healthcare_system.payment;

import org.springframework.stereotype.Service;

@Service
public class OnlinePaymentService implements PaymentService {

    @Override
    public String processPayment(double amount) {
        return "Payment of ₹" + amount + " processed successfully.";
    }
}