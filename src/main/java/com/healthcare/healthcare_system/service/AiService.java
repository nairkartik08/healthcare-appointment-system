package com.healthcare.healthcare_system.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public String getTriageRecommendation(String symptoms) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + geminiApiKey;
        RestTemplate restTemplate = new RestTemplate();

        try {
            // Construct the exact nested JSON structure Gemini requires
            Map<String, Object> requestBody = new HashMap<>();
            
            List<Map<String, Object>> contentsList = new ArrayList<>();
            Map<String, Object> contentMap = new HashMap<>();
            
            List<Map<String, String>> partsList = new ArrayList<>();
            Map<String, String> partMap = new HashMap<>();
            
            String prompt = "You are a professional medical triage scheduling assistant for a healthcare portal. " +
                    "A patient will provide their symptoms. You must analyze the symptoms and recommend EXACTLY ONE type of doctor specialization they should see from this list if possible (e.g., Cardiologist, Dermatologist, Orthopedic, Pediatrician, General Physician, Neurologist, Psychiatrist, etc.). " +
                    "Keep your response extremely concise, friendly, and under 3 sentences. " +
                    "Patient Symptoms: " + symptoms;
            
            partMap.put("text", prompt);
            partsList.add(partMap);
            
            contentMap.put("parts", partsList);
            contentsList.add(contentMap);
            
            requestBody.put("contents", contentsList);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Execute request
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();

            // Safely parse the response
            if (responseBody != null && responseBody.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> firstCandidate = candidates.get(0);
                    Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
                    if (content != null && content.containsKey("parts")) {
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                        if (!parts.isEmpty()) {
                            return (String) parts.get(0).get("text");
                        }
                    }
                }
            }
            return "I'm sorry, I couldn't process your request at this time. Please consult a General Physician.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Error while connecting to the AI assistant. Please try again later.";
        }
    }
}
