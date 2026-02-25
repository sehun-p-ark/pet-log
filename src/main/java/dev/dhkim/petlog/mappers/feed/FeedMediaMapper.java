package dev.dhkim.petlog.mappers.feed;

import dev.dhkim.petlog.entities.feed.FeedMediaEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FeedMediaMapper {
    // db에 dummyFeedMedia 넣기
    int insertFeedMediaList(List<FeedMediaEntity> list);

    // 삭제된 미디어들 삭제
    int deleteNotIn(@Param("feedId") int feedId,
                    @Param("keepMediaIds") List<Integer> keepMediaIds);

    // 기존에 있던 미디어들 sort 업데이트
    int updateSortOrders(@Param("list") List<FeedMediaEntity> list);

    // 미디어들 조회(여러개 피드)
    List<FeedMediaEntity> selectByFeedIds(@Param("feedIds") List<Integer> feedIds);

    // 미디어들 조회(하나의 피드)
    List<FeedMediaEntity> selectMediaByFeedId(int id);
}
