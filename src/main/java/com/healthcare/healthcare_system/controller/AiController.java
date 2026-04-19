package com.healthcare.healthcare_system.controller;

import com.healthcare.healthcare_system.dto.AiTriageRequest;
import com.healthcare.healthcare_system.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/patient/ai-triage")
@CrossOrigin("*")
public class AiController {

    @Autowired
    private AiService aiService;

    @PostMapping
    public ResponseEntity<Map<String, String>> getTriage(@RequestBody AiTriageRequest request) {
        String recommendation = aiService.getTriageRecommendation(request.getSymptoms());
        
        Map<String, String> response = new HashMap<>();
        response.put("recommendation", recommendation);
        
        return ResponseEntity.ok(response);
    }
}
