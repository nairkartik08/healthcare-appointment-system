package com.healthcare.healthcare_system.dto;

public class DoctorWorkloadDTO {

    private Long doctorId;
    private String doctorName;
    private Long appointments;

    public DoctorWorkloadDTO(Long doctorId, String doctorName, Long appointments) {
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.appointments = appointments;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public Long getAppointments() {
        return appointments;
    }
}
