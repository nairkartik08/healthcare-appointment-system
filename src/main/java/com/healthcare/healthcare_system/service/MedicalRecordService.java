package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.model.MedicalRecord;
import java.util.List;
import com.healthcare.healthcare_system.dto.VisitHistoryDTO;

public interface MedicalRecordService {

    MedicalRecord addDiagnosis(Long appointmentId, MedicalRecord record);

    List<MedicalRecord> getPatientRecords(Long patientId);
    List<VisitHistoryDTO> getVisitHistory(Long patientId);
    MedicalRecord updateRecord(Long appointmentId, MedicalRecord record);
}