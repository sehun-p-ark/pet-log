package dev.dhkim.petlog.entities.chat;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatMessageEntity {
    private int id;
    private int roomId;
    private int senderId;
    private String message;
    private LocalDateTime createdAt;
}
