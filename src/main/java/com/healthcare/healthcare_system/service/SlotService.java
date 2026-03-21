package com.healthcare.healthcare_system.service;

import com.healthcare.healthcare_system.model.Slot;

import java.util.List;

public interface SlotService {

    Slot createSlot(Long doctorId, Slot slot);

    List<Slot> getSlotsByDoctor(Long doctorId);
}