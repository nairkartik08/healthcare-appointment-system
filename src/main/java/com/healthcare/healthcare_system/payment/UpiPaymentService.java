package com.healthcare.healthcare_system.payment;

import org.springframework.stereotype.Service;

@Service("upiPayment")
public class UpiPaymentService implements PaymentService {

    @Override
    public String processPayment(double amount) {
        return "UPI Payment of ₹" + amount + " successful.";
    }
}