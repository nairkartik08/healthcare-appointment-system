package com.healthcare.healthcare_system.model;

import jakarta.persistence.*;

@Entity
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Patient patient;

    @ManyToOne
    private Doctor doctor;

    @ManyToOne
    private Slot slot;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;

    @Column(name = "payment_mode")
    private String paymentMode;

    public Appointment() {}

    public Long getId() { return id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public Slot getSlot() { return slot; }
    public void setSlot(Slot slot) { this.slot = slot; }

    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }

    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }
}