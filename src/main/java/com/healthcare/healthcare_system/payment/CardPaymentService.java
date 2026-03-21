package com.healthcare.healthcare_system.payment;

import org.springframework.stereotype.Service;

@Service("cardPayment")
public class CardPaymentService implements PaymentService {

    @Override
    public String processPayment(double amount) {
        return "Card Payment of ₹" + amount + " successful.";
    }
}