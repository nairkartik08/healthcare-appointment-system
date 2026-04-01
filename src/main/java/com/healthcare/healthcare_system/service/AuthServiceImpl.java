package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.model.User;
import com.healthcare.healthcare_system.model.Role;
import com.healthcare.healthcare_system.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.healthcare.healthcare_system.model.Patient;
import com.healthcare.healthcare_system.repository.PatientRepository;
import com.healthcare.healthcare_system.model.Clinic;
import com.healthcare.healthcare_system.repository.ClinicRepository;
import com.healthcare.healthcare_system.model.Doctor;
import com.healthcare.healthcare_system.repository.DoctorRepository;
import com.healthcare.healthcare_system.model.Admin;
import com.healthcare.healthcare_system.repository.AdminRepository;
import com.healthcare.healthcare_system.dto.RegisterRequest;


@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final PatientRepository patientRepository;
    private final ClinicRepository clinicRepository;
    private final DoctorRepository doctorRepository;
    private final AdminRepository adminRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public AuthServiceImpl(UserRepository userRepository,
                           BCryptPasswordEncoder passwordEncoder,
                           PatientRepository patientRepository,
                           ClinicRepository clinicRepository,
                           DoctorRepository doctorRepository,
                           AdminRepository adminRepository,
                           org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.patientRepository = patientRepository;
        this.clinicRepository = clinicRepository;
        this.doctorRepository = doctorRepository;
        this.adminRepository = adminRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @jakarta.annotation.PostConstruct
    public void dropObsoleteRoleConstraints() {
        try {
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            System.out.println("✅ SUCCESSFULLY CLEARED OBSOLETE 'users_role_check' CONSTRAINT FROM POSTGRESQL.");
        } catch (Exception e) {
            System.out.println("⚠️ Could not drop constraint, it might not exist: " + e.getMessage());
        }
    }

    @Override
    public User register(RegisterRequest request) {

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username is already taken. Please choose another one.");
        }

        Role role = Role.valueOf(request.getRole().toUpperCase());

        if (role == Role.ADMIN) {
            String adminCode = request.getAdminCode();
            if (adminCode == null || !adminCode.trim().equalsIgnoreCase("HCADMIN2026")) {
                throw new RuntimeException("Invalid Admin Code. Received: [" + adminCode + "]. Please check and try again.");
            }
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);

        user = userRepository.save(user);

        if (role == Role.PATIENT) {
            Patient patient = new Patient();
            patient.setName(request.getFullName() != null ? request.getFullName() : request.getUsername());
            patient.setEmail(request.getEmail());
            patient.setMobileNo(request.getMobileNumber());
            patient.setGender(request.getGender());
            patient.setDob(request.getDob());
            patient.setBloodGroup(request.getBloodGroup());
            patient.setAddress(request.getAddress());
            patient.setEmergencyContact(request.getEmergencyContact());
            patient.setExistingDiseases(request.getExistingDiseases());
            patient.setInsuranceProvider(request.getInsuranceProvider());
            patient.setUserId(user.getId());
            patientRepository.save(patient);
        } else if (role == Role.CLINIC) {
            Clinic clinic = new Clinic();
            clinic.setName(request.getHospitalName() != null ? request.getHospitalName() : "Central Hospital");
            clinic.setLocation(request.getClinicAddress());
            clinic.setUserId(user.getId()); // Store user id on clinic if needed
            clinic = clinicRepository.save(clinic);

            Doctor doctor = new Doctor();
            doctor.setName(request.getFullName() != null ? request.getFullName() : request.getUsername());
            doctor.setEmail(request.getEmail());
            doctor.setMobileNo(request.getMobileNumber());
            doctor.setGender(request.getGender());
            doctor.setSpecialization(request.getSpecialization());
            doctor.setQualification(request.getQualification());
            doctor.setExperienceYears(request.getExperienceYears() != null ? request.getExperienceYears() : 0);
            doctor.setLicenseNumber(request.getLicenseNumber());
            doctor.setHospitalName(request.getHospitalName());
            doctor.setConsultationFee(request.getConsultationFees());
            doctor.setAvailableDays(request.getAvailableDays());
            doctor.setAvailableTimeSlots(request.getAvailableTimeSlots());
            doctor.setClinicAddress(request.getClinicAddress());
            doctor.setProfilePhotoUrl(request.getProfilePhotoUrl());
            doctor.setUserId(user.getId());
            doctor.setClinic(clinic);
            // Optionally link doctor back to User if we need it directly, currently Clinic links to User
            doctorRepository.save(doctor);
            
        } else if (role == Role.ADMIN) {
            Admin admin = new Admin();
            admin.setFullName(request.getFullName() != null ? request.getFullName() : request.getUsername());
            admin.setEmail(request.getEmail());
            admin.setDepartment(request.getDepartment());
            admin.setContactNumber(request.getMobileNumber());
            admin.setUserId(user.getId());
            adminRepository.save(admin);
        }

        return user;
    }
}