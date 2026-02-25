package dev.dhkim.petlog.dto.chat;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatWsMessageDto {
    private int roomId;
    private int senderId;
    private String message;
    private LocalDateTime createdAt;
}
