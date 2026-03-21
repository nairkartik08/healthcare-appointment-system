package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.model.Doctor;
import com.healthcare.healthcare_system.model.Slot;
import com.healthcare.healthcare_system.repository.DoctorRepository;
import com.healthcare.healthcare_system.repository.SlotRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SlotServiceImpl implements SlotService {

    private final SlotRepository slotRepository;
    private final DoctorRepository doctorRepository;

    public SlotServiceImpl(SlotRepository slotRepository,
                           DoctorRepository doctorRepository) {
        this.slotRepository = slotRepository;
        this.doctorRepository = doctorRepository;
    }

    @Override
    public Slot createSlot(Long doctorId, Slot slot) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow();

        slot.setDoctor(doctor);
        slot.setBooked(false);

        return slotRepository.save(slot);
    }

    @Override
    public List<Slot> getSlotsByDoctor(Long doctorId) {

        return slotRepository.findByDoctorId(doctorId);
    }
}