package dev.dhkim.petlog.mappers.feed;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FeedLikeMapper {
    // 피드 좋아요 추가
    int insert(@Param("feedId") int feedId,
               @Param("userId") int userId);

    // 피드 좋아요 삭제
    int delete(@Param("feedId") int feedId,
               @Param("userId") int userId);

    // 좋아요 한 피드 조회
    List<Integer> selectLikedFeedIds(@Param("userId") Integer userId,
                                     @Param("feedIds") List<Integer> feedIds);

    boolean existsFeedLike (@Param("feedId") int feedId,
                            @Param("userId") Integer userId);

}
