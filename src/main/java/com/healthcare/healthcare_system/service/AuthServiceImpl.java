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
    private final EmailService emailService;

    public AuthServiceImpl(UserRepository userRepository,
                           BCryptPasswordEncoder passwordEncoder,
                           PatientRepository patientRepository,
                           ClinicRepository clinicRepository,
                           DoctorRepository doctorRepository,
                           AdminRepository adminRepository,
                           org.springframework.jdbc.core.JdbcTemplate jdbcTemplate,
                           EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.patientRepository = patientRepository;
        this.clinicRepository = clinicRepository;
        this.doctorRepository = doctorRepository;
        this.adminRepository = adminRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.emailService = emailService;
    }

    @jakarta.annotation.PostConstruct
    public void dropObsoleteRoleConstraints() {
        try {
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            System.out.println("✅ SUCCESSFULLY CLEARED OBSOLETE 'users_role_check' CONSTRAINT FROM POSTGRESQL.");
            try {
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN is_verified boolean DEFAULT false");
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN otp_code varchar(255)");
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN otp_expiry_time timestamp");
                System.out.println("✅ ADDED missing columns for OTP feature to POSTGRESQL.");
            } catch (Exception e) {
                System.out.println("⚠️ Columns might already exist: " + e.getMessage());
            }
        } catch (Exception e) {
            System.out.println("⚠️ Could not drop constraint, it might not exist: " + e.getMessage());
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public User register(RegisterRequest request) {

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username is already taken. Please choose another one.");
        }

        // Email Domain Restriction Check
        String emailToVerify = request.getEmail();
        if (emailToVerify != null) {
            String lowerEmail = emailToVerify.toLowerCase();
            if (lowerEmail.contains("@test.com") || lowerEmail.contains("@fake.com") || lowerEmail.matches(".*@abc\\..*")) {
                throw new RuntimeException("Registration using domains like @test.com, @fake.com, or @abc is not allowed. Please use your hospital domain.");
            }
        }

        Role role = Role.valueOf(request.getRole().toUpperCase());

        if (role == Role.ADMIN) {
            String adminCode = request.getAdminCode();
            if (adminCode == null || !adminCode.trim().equalsIgnoreCase("KNADMIN2026")) {
                throw new RuntimeException("Invalid Admin Code. Received: [" + adminCode + "]. Please check and try again.");
            }
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        
        if (role == Role.CLINIC) {
            user.setApprovalStatus("PENDING_APPROVAL");
        } else {
            user.setApprovalStatus("APPROVED");
        }
        
        user.setVerified(false);
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        user.setOtpCode(otp);
        user.setOtpExpiryTime(java.time.LocalDateTime.now().plusMinutes(10));

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

            // Validate License Format
            String licenseNumber = request.getLicenseNumber();
            if (licenseNumber == null || !licenseNumber.matches("^[A-Z]{2}-DOC-[0-9]{6}$")) {
                throw new RuntimeException("Invalid Medical License Format. Example: MH-DOC-123456");
            }
            // Check License Uniqueness
            if (doctorRepository.findByLicenseNumber(licenseNumber).isPresent()) {
                throw new RuntimeException("A doctor with this Medical License Number is already registered.");
            }

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
            doctor.setLicenseCertificateUrl(request.getLicenseCertificateUrl());
            doctor.setDegreeUrl(request.getDegreeUrl());
            doctor.setHospitalIdUrl(request.getHospitalIdUrl());
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

        System.out.println("==================================================");
        System.out.println("🔐 ATTEMPTING TO SEND OTP FOR " + request.getEmail() + " : " + otp);
        System.out.println("==================================================");

        // This will now throw an exception if SMTP credentials are wrong, which rolls back the entire transaction!
        emailService.sendOtpEmail(request.getEmail(), otp);

        return user;
    }

    @Override
    public String verifyOtp(com.healthcare.healthcare_system.dto.OtpVerificationRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));

        if (user.isVerified()) {
            return "User is already verified.";
        }

        if (user.getOtpExpiryTime() == null || user.getOtpExpiryTime().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        if (!user.getOtpCode().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP Code.");
        }

        user.setVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiryTime(null);
        userRepository.save(user);

        return "Email verified successfully.";
    }
}