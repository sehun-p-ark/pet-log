package dev.dhkim.petlog.entities.feed;

import dev.dhkim.petlog.enums.feed.MediaType;
import dev.dhkim.petlog.enums.feed.Source;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class FeedMediaEntity {
    private int id;
    private int feedId;
    private String mediaUrl;
    private String thumbnailUrl;
    private MediaType mediaType;
    private int sortOrder;
    private Source source;
}
