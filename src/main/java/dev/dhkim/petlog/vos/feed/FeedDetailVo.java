package dev.dhkim.petlog.vos.feed;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FeedDetailVo {
    private int id;
    private int userId;
    private String title;
    private String content;
    private int likeCount;
    private int commentCount;
    //todo 계속 작성해야 함

}
