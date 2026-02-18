package dev.dhkim.petlog.dto.feed;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FeedDto {
    private int feedId;
    private int userId;
    private String nickname;
    private String address;
    private String profileImageUrl;
    private String title;
    private String content;
    private boolean liked;
    private int likeCount;
    private int commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<FeedMediaDto> feedMediaDtos;
}
