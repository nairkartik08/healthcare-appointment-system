package com.healthcare.healthcare_system.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OtpVerificationRequest {
    private String email;
    private String otp;
}
