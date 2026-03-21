package com.healthcare.healthcare_system.dto;

import java.time.LocalDateTime;

public class VisitHistoryDTO {

    private LocalDateTime visitDate;
    private String doctorName;
    private String diagnosis;
    private String prescription;

    public VisitHistoryDTO(LocalDateTime visitDate,
                           String doctorName,
                           String diagnosis,
                           String prescription) {
        this.visitDate = visitDate;
        this.doctorName = doctorName;
        this.diagnosis = diagnosis;
        this.prescription = prescription;
    }

    public LocalDateTime getVisitDate() {
        return visitDate;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public String getPrescription() {
        return prescription;
    }
}