package dev.dhkim.petlog.dto.chat;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatMessageDto {
    private int messageId;
    private int roomId;
    private int senderId;
    private String message;
    private LocalDateTime createdAt;
}
