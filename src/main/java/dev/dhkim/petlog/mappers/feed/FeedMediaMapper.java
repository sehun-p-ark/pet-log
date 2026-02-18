package dev.dhkim.petlog.mappers.feed;

import dev.dhkim.petlog.entities.feed.FeedMediaEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FeedMediaMapper {
    // db에 dummyFeedMedia 넣기
    int insertFeedMediaList(List<FeedMediaEntity> list);

    List<FeedMediaEntity> selectByFeedIds(@Param("feedIds") List<Integer> feedIds);

    List<FeedMediaEntity> selectMediaByFeedId(int id);
}
