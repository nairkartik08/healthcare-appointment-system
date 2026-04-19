package com.healthcare.healthcare_system.controller;

import com.healthcare.healthcare_system.dto.ReviewRequest;
import com.healthcare.healthcare_system.dto.ReviewDTO;
import com.healthcare.healthcare_system.model.Doctor;
import com.healthcare.healthcare_system.model.Patient;
import com.healthcare.healthcare_system.model.Review;
import com.healthcare.healthcare_system.repository.DoctorRepository;
import com.healthcare.healthcare_system.repository.PatientRepository;
import com.healthcare.healthcare_system.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/reviews")
@CrossOrigin("*")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @PostMapping("/add")
    public ResponseEntity<?> addReview(@RequestBody ReviewRequest request) {
        try {
            if (reviewRepository.existsByPatientIdAndDoctorId(request.getPatientId(), request.getDoctorId())) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "You have already reviewed this doctor.");
                return ResponseEntity.badRequest().body(response);
            }

            Patient patient = patientRepository.findById(request.getPatientId()).orElse(null);
            Doctor doctor = doctorRepository.findById(request.getDoctorId()).orElse(null);

            if (patient == null || doctor == null) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Invalid patient or doctor ID. Cannot verify identities.");
                return ResponseEntity.badRequest().body(response);
            }

            Review review = new Review();
            review.setPatient(patient);
            review.setDoctor(doctor);
            review.setRating(request.getRating());
            review.setComment(request.getComment());
            review.setCreatedAt(LocalDateTime.now());
            
            reviewRepository.save(review);
            
            // Update Doctor's average rating
            List<Review> doctorReviews = reviewRepository.findByDoctorIdOrderByCreatedAtDesc(doctor.getId());
            double avg = doctorReviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
            avg = Math.round(avg * 10.0) / 10.0;
            
            doctor.setRating(avg);
            doctorRepository.save(doctor);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Review submitted successfully!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> res = new HashMap<>();
            res.put("message", "Exception details: " + e.toString());
            return ResponseEntity.status(400).body(res);
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<ReviewDTO>> getDoctorReviews(@PathVariable Long doctorId) {
        List<Review> reviews = reviewRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
        List<ReviewDTO> response = reviews.stream().map(r -> {
            ReviewDTO dto = new ReviewDTO();
            dto.setId(r.getId());
            dto.setRating(r.getRating());
            dto.setComment(r.getComment());
            dto.setPatientName(r.getPatient() != null ? r.getPatient().getName() : "Anonymous");
            dto.setCreatedAt(r.getCreatedAt());
            return dto;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patient/{patientId}/doctors")
    public ResponseEntity<List<Long>> getReviewedDoctorIds(@PathVariable Long patientId) {
        List<Long> doctorIds = reviewRepository.findDoctorIdsByPatientId(patientId);
        return ResponseEntity.ok(doctorIds);
    }
}
