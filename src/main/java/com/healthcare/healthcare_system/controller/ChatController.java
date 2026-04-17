package com.healthcare.healthcare_system.controller;

import com.healthcare.healthcare_system.dto.ChatRequest;
import com.healthcare.healthcare_system.model.ChatMessage;
import com.healthcare.healthcare_system.model.User;
import com.healthcare.healthcare_system.repository.ChatMessageRepository;
import com.healthcare.healthcare_system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import java.util.stream.Collectors;
import java.util.ArrayList;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @MessageMapping("/chat")
    public void processMessage(@Payload ChatRequest chatRequest) {
        System.out.println("====== RECEIVED WEBSOCKET MESSAGE ======");
        System.out.println("Sender: " + chatRequest.getSenderId() + ", Receiver: " + chatRequest.getReceiverId() + ", Content: " + chatRequest.getContent());
        
        try {
            ChatMessage chatMessage = new ChatMessage();
            chatMessage.setSenderId(chatRequest.getSenderId());
            chatMessage.setReceiverId(chatRequest.getReceiverId());
            chatMessage.setSenderName(chatRequest.getSenderName());
            chatMessage.setContent(chatRequest.getContent());

            ChatMessage savedMsg = chatMessageRepository.save(chatMessage);
            System.out.println("====== MESSAGE SAVED TO DB WITH ID: " + savedMsg.getId() + " ======");

        User receiver = userRepository.findById(chatRequest.getReceiverId()).orElse(null);
        if (receiver != null) {
            System.out.println("====== SENDING MESSAGE TO RECEIVER: " + receiver.getUsername() + " ======");
            messagingTemplate.convertAndSendToUser(
                    receiver.getUsername(), "/queue/messages",
                    savedMsg
            );
        } else {
            System.out.println("====== RECEIVER NOT FOUND IN DB. ID: " + chatRequest.getReceiverId() + " ======");
        }
        
        } catch (Exception e) {
            System.err.println("====== EXCEPTION IN PROCESS MESSAGE: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @GetMapping("/chat/history/{user1}/{user2}")
    @ResponseBody
    public ResponseEntity<List<ChatMessage>> getChatHistory(@PathVariable Long user1, @PathVariable Long user2) {
        List<ChatMessage> history = chatMessageRepository.findChatHistory(user1, user2);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/chat/contacts/{userId}")
    @ResponseBody
    public ResponseEntity<List<User>> getContacts(@PathVariable Long userId) {
        User currentUser = userRepository.findById(userId).orElse(null);
        if (currentUser == null) return ResponseEntity.badRequest().build();

        String targetRole = currentUser.getRole().name().equals("PATIENT") ? "CLINIC" : "PATIENT";
        
        List<User> contacts = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && (u.getRole().name().equals(targetRole) || u.getRole().name().equals("DOCTOR")))
                .map(u -> {
                    u.setPassword(null);
                    return u;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(contacts);
    }
}
