package dev.dhkim.petlog.dto.chat;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatFriendDto {
    private int userId;
    private String nickname;
    private String profileImageUrl;
    private LocalDateTime followedAt;
}
