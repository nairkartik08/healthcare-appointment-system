package com.healthcare.healthcare_system.config;

import com.healthcare.healthcare_system.model.Doctor;
import com.healthcare.healthcare_system.model.Clinic;
import com.healthcare.healthcare_system.repository.DoctorRepository;
import com.healthcare.healthcare_system.repository.ClinicRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final DoctorRepository doctorRepository;
    private final ClinicRepository clinicRepository;

    public DataSeeder(DoctorRepository doctorRepository, ClinicRepository clinicRepository) {
        this.doctorRepository = doctorRepository;
        this.clinicRepository = clinicRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Cleaning up previously seeded dummy doctors from the database...");
        java.util.List<String> dummyNames = java.util.Arrays.asList(
            "Sarah Jenkins", "Vikram Patel", "Emily Chen", "Marcus Vance", "Amina Rahman"
        );
        java.util.List<Doctor> doctors = doctorRepository.findAll();
        for(Doctor d : doctors) {
            if(dummyNames.contains(d.getName())) {
                doctorRepository.delete(d);
                System.out.println("Deleted dummy doctor: " + d.getName());
            }
        }
        System.out.println("Cleanup complete!");
    }
}
