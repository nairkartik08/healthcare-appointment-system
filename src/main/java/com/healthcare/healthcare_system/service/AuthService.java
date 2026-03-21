package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.model.User;
import com.healthcare.healthcare_system.model.Role;

public interface AuthService {
    User register(String username, String password, Role role);
}