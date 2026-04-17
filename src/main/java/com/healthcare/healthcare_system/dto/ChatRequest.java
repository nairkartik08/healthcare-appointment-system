package com.healthcare.healthcare_system.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private Long senderId;
    private Long receiverId;
    private String content;
    private String senderName;
}
