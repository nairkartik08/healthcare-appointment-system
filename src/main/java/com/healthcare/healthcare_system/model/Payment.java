package com.healthcare.healthcare_system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private Invoice invoice;

    @ManyToOne
    private Patient patient;

    private Double amount;

    private String method;

    private String status;

    private LocalDateTime paymentTime;

    public Payment(){}

    public Long getId(){ return id; }

    public Invoice getInvoice(){ return invoice; }
    public void setInvoice(Invoice invoice){ this.invoice = invoice; }

    public Patient getPatient(){ return patient; }
    public void setPatient(Patient patient){ this.patient = patient; }

    public Double getAmount(){ return amount; }
    public void setAmount(Double amount){ this.amount = amount; }

    public String getMethod(){ return method; }
    public void setMethod(String method){ this.method = method; }

    public String getStatus(){ return status; }
    public void setStatus(String status){ this.status = status; }

    public LocalDateTime getPaymentTime(){ return paymentTime; }
    public void setPaymentTime(LocalDateTime paymentTime){ this.paymentTime = paymentTime; }
}