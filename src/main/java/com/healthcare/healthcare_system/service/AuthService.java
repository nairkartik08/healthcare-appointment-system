package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.model.User;
import com.healthcare.healthcare_system.model.Role;

import com.healthcare.healthcare_system.dto.RegisterRequest;

public interface AuthService {
    User register(RegisterRequest request);
}