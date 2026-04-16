package com.healthcare.healthcare_system.repository;

import com.healthcare.healthcare_system.model.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {
}
