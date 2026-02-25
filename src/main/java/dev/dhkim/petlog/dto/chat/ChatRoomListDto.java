package dev.dhkim.petlog.dto.chat;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatRoomListDto {
    private int roomId;
    private String nickname;
    private String lastMessage;
    private Integer lastSenderId;
    private LocalDateTime lastMessageAt;
    private Integer unReadCount;
}
