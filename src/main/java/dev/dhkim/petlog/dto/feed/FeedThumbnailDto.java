package dev.dhkim.petlog.dto.feed;

import dev.dhkim.petlog.enums.feed.MediaType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FeedThumbnailDto {
    private int feedId;
    private String thumbnailUrl;
    private MediaType mediaType;
}
