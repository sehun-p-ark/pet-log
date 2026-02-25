package dev.dhkim.petlog.dto.chat;

import lombok.Data;

@Data
public class ChatWsSendDto {
    private int roomId;
    private int senderId;
    private String message;
}
