package dev.dhkim.petlog.dto.feed;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class FeedSearchDto {
    private int feedId;
    private String nickname;
    private String address;
    private String profileImageUrl;
    private String thumbnailUrl;
    private String title;
    private int likeCount;
    private int commentCount;
    private LocalDateTime createdAt;
    private boolean liked;
}
