package dev.dhkim.petlog.dto.feed;

import dev.dhkim.petlog.enums.feed.MediaType;
import dev.dhkim.petlog.enums.feed.Source;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FeedMediaDto {
    private int id;
    private int feedId;
    private String mediaUrl;   // 이미지 or 영상 주소
    private MediaType mediaType; // IMAGE / VIDEO
    private int sortOrder;     // 정렬 순서
    private Source source; // DOG_API, CAT_API, USER_UPLOAD
}
