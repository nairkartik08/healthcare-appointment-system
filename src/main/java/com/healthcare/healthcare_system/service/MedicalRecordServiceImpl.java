package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.model.*;
import com.healthcare.healthcare_system.repository.*;
import com.healthcare.healthcare_system.dto.VisitHistoryDTO;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicalRecordServiceImpl implements MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;

    public MedicalRecordServiceImpl(MedicalRecordRepository medicalRecordRepository,
                                    AppointmentRepository appointmentRepository) {

        this.medicalRecordRepository = medicalRecordRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public MedicalRecord addDiagnosis(Long appointmentId, MedicalRecord record) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow();

        record.setAppointment(appointment);
        record.setPatient(appointment.getPatient());
        record.setDoctor(appointment.getDoctor());

        return medicalRecordRepository.save(record);
    }

    @Override
    public List<MedicalRecord> getPatientRecords(Long patientId) {
        return medicalRecordRepository.findByPatientId(patientId);
    }

    @Override
    public MedicalRecord updateRecord(Long appointmentId, MedicalRecord newRecord) {

        MedicalRecord record = medicalRecordRepository
                .findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Record not found"));

        record.setDiagnosis(newRecord.getDiagnosis());
        record.setSymptoms(newRecord.getSymptoms());
        record.setTreatment(newRecord.getTreatment());

        return medicalRecordRepository.save(record);
    }

    @Override
    public List<VisitHistoryDTO> getVisitHistory(Long patientId) {

        List<MedicalRecord> records =
                medicalRecordRepository.findByPatientIdOrderByVisitDateDesc(patientId);

        return records.stream()
                .map(r -> new VisitHistoryDTO(
                        r.getVisitDate(),
                        r.getDoctor().getName(),
                        r.getDiagnosis(),
                        r.getTreatment()
                ))
                .toList();
    }
}