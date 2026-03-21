package com.healthcare.healthcare_system.dto;

public class DashboardDTO {

    private Long totalDoctors;
    private Long totalPatients;
    private Long todayAppointments;
    private Double todayRevenue;

    public DashboardDTO(Long totalDoctors,
                        Long totalPatients,
                        Long todayAppointments,
                        Double todayRevenue) {

        this.totalDoctors = totalDoctors;
        this.totalPatients = totalPatients;
        this.todayAppointments = todayAppointments;
        this.todayRevenue = todayRevenue;
    }

    public Long getTotalDoctors(){ return totalDoctors; }

    public Long getTotalPatients(){ return totalPatients; }

    public Long getTodayAppointments(){ return todayAppointments; }

    public Double getTodayRevenue(){ return todayRevenue; }
}