package dev.dhkim.petlog.services.feed;

import dev.dhkim.petlog.entities.feed.FeedEntity;
import dev.dhkim.petlog.entities.feed.FeedMediaEntity;
import dev.dhkim.petlog.mappers.FeedMapper;
import dev.dhkim.petlog.mappers.FeedMediaMapper;
import dev.dhkim.petlog.vos.feed.FeedMediaVo;
import dev.dhkim.petlog.vos.feed.FeedResponseVo;
import dev.dhkim.petlog.vos.feed.FeedScrollResponseVo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedApiService {

    private final FeedMapper feedMapper;
    private final FeedMediaMapper feedMediaMapper;

    // feed 전체 조회 (lastFeedId보다 작은 값, size갯수만큼)
    // 무한 스크롤 로딩할 것 찾아오는 거임
    public FeedScrollResponseVo getFeeds(Integer lastFeedId, int size) {
        List<FeedResponseVo> feedList = feedMapper.selectFeedsForScroll(lastFeedId, size + 1);

        boolean hasNext = feedList.size() > size; // size만큼 조회 후 다음 게시물 유무

        if(hasNext) { // hasNext가 있으면 -> 마지막 +1 조회했던거 지우기
            feedList.remove(size);
        }

        List<Integer> feedIds = feedList.stream()
                .map(FeedResponseVo::getId)
                .toList(); // 조회한 결과에서 ID만 뽑아내서 리스트로 만들기

        if(feedIds.isEmpty()) { // 조회 결과가 비었으면?
            return FeedScrollResponseVo.builder()
                    .feedResponseVos(Collections.emptyList()) // 빈 리스트
                    .lastFeedId(null) // 마지막 게시물 없음
                    .hasNext(false) // 다음 게시물 없음
                    .build();
        }

        List<FeedMediaEntity> mediaList = feedMediaMapper.selectByFeedIds(feedIds);

        Map<Integer, List<FeedMediaVo>> mediaMap = mediaList.stream()
                .collect(Collectors.groupingBy(
                    FeedMediaEntity::getFeedId, // Entity에서 Id가 같은 것 끼리 묶기
                    Collectors.mapping( // Entity -> Vo로 변환시키기
                        media -> FeedMediaVo.builder()
                                            .mediaUrl(media.getMediaUrl())
                                            .mediaType(media.getMediaType())
                                            .sortOrder(media.getSortOrder())
                                            .build(),
                        Collectors.toList() // 변경된 Vo를 리스트 형태로 만들기
                    )
                ));

        feedList.forEach(feed ->
                feed.setFeedMediaVos( // 피드별 미디어 리스트 설정
                        mediaMap.getOrDefault(feed.getId(), Collections.emptyList())
                )
        );

        Integer nextLastFeedId = hasNext //다음 페이지 조회를 위한 마지막 피드 ID 설정
                ? feedList.get(feedList.size() -1).getId()
                : null;

        return FeedScrollResponseVo.builder()
                .feedResponseVos(feedList)
                .lastFeedId(nextLastFeedId)
                .hasNext(hasNext)
                .build();
    }
}
