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
        // Only seed data if the doctor table is empty
        if (doctorRepository.count() == 0) {
            System.out.println("Seeding initial test doctors into the database...");
            
            // Create a default clinic to associate with doctors if none exists
            Clinic defaultClinic;
            if (clinicRepository.count() == 0) {
                defaultClinic = new Clinic();
                defaultClinic.setName("City General Hospital");
                defaultClinic.setLocation("Downtown Medical Hub");
                defaultClinic = clinicRepository.save(defaultClinic);
            } else {
                defaultClinic = clinicRepository.findAll().get(0);
            }

            // Seed Doctors
            Doctor d1 = new Doctor();
            d1.setName("Sarah Jenkins");
            d1.setSpecialization("Cardiologist");
            d1.setExperienceYears(12);
            d1.setConsultationFee(1500.0);
            d1.setRating(4.9);
            d1.setClinic(defaultClinic);
            
            Doctor d2 = new Doctor();
            d2.setName("Vikram Patel");
            d2.setSpecialization("Neurologist");
            d2.setExperienceYears(8);
            d2.setConsultationFee(2000.0);
            d2.setRating(4.7);
            d2.setClinic(defaultClinic);

            Doctor d3 = new Doctor();
            d3.setName("Emily Chen");
            d3.setSpecialization("Pediatrician");
            d3.setExperienceYears(5);
            d3.setConsultationFee(800.0);
            d3.setRating(4.8);
            d3.setClinic(defaultClinic);

            Doctor d4 = new Doctor();
            d4.setName("Marcus Vance");
            d4.setSpecialization("Orthopedics");
            d4.setExperienceYears(15);
            d4.setConsultationFee(2500.0);
            d4.setRating(5.0);
            d4.setClinic(defaultClinic);

            Doctor d5 = new Doctor();
            d5.setName("Amina Rahman");
            d5.setSpecialization("Dermatologist");
            d5.setExperienceYears(6);
            d5.setConsultationFee(1200.0);
            d5.setRating(4.6);
            d5.setClinic(defaultClinic);

            doctorRepository.save(d1);
            doctorRepository.save(d2);
            doctorRepository.save(d3);
            doctorRepository.save(d4);
            doctorRepository.save(d5);
            
            System.out.println("Dummy doctors seeded successfully!");
        }
    }
}
