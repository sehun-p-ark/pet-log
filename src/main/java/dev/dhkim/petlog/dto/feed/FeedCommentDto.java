package dev.dhkim.petlog.dto.feed;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class FeedCommentDto {
    private int commentId;
    private int feedId;
    private int userId;
    private Integer parentCommentId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String nickname;
    private String profileImageUrl;
    private List<FeedCommentDto> replies;
}

