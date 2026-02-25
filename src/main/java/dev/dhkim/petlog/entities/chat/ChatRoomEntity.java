package dev.dhkim.petlog.entities.chat;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatRoomEntity {
    private int id;
    private LocalDateTime createdAt;
}
