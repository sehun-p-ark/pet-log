package dev.dhkim.petlog.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatNotifyDto {
    private int roomId;
    private int fromUserId;
    private String lastMessage;
    private String createdAt; // ISO string or yyyy-MM-dd HH:mm:ss
    private String type;      // "NEW_MESSAGE" | "ROOM_CREATED"
}
