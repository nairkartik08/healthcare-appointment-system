package com.healthcare.healthcare_system.dto;

import lombok.Data;
import java.util.List;

@Data
public class CampaignRequest {
    private String campaignName;
    private String notificationTitle;
    private String message;
    private List<Long> patientIds;
}
