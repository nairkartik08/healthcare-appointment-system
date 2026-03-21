package com.healthcare.healthcare_system.repository;

import com.healthcare.healthcare_system.model.Slot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SlotRepository extends JpaRepository<Slot, Long> {

    List<Slot> findByDoctorId(Long doctorId);

}
