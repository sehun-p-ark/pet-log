package dev.dhkim.petlog.mappers;

import dev.dhkim.petlog.entities.feed.FeedEntity;
import dev.dhkim.petlog.vos.feed.FeedResponseVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FeedMapper {
    // db에 dummyFeed 넣기
    int insertFeed(FeedEntity feed);

    // 무한 스크롤을 위한 조회
    List<FeedResponseVo> selectFeedsForScroll(@Param("lastFeedId") Integer lastFeedId,
                                              @Param("size") int size);
}
