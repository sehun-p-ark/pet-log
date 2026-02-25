package dev.dhkim.petlog.dto.feed;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FeedDetailDto {
    private int feedId;
    private int userId;
    private String profileImageUrl;
    private String nickname;
    private String address;
    private String title;
    private String content;
    private boolean liked;
    private int likeCount;
    private int commentCount;
    private List<FeedMediaDto> feedMediaDtos;
    private List<FeedCommentDto> comments;
    private boolean isWriter;
}
