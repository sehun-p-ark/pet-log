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
public class FeedScrollDto {
    // 실제 피드 목록
    private List<FeedDto> feedDtos;
    // 다음 페이지 요청할 때 사용할 마지막 피드 ID
    private Integer lastFeedId;
    // 마지막 피드 좋아요 수
    private Integer lastLikeCount;
    // 마지막 피드 작성 일자
    private String lastCreatedAt;
    // 다음 데이터가 더 있는지 여부
    private boolean hasNext;
}

