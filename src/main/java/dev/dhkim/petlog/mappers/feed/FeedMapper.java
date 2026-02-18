package dev.dhkim.petlog.mappers.feed;

import dev.dhkim.petlog.dto.feed.FeedDto;
import dev.dhkim.petlog.dto.feed.FeedThumbnailDto;
import dev.dhkim.petlog.entities.feed.FeedEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FeedMapper {
    // db에 dummyFeed 넣기
    int insertFeed(FeedEntity feed);

    // 무한 스크롤 피드 조회 (최신순)
    List<FeedDto> selectFeeds(@Param("sort") String sort,
                              @Param("lastFeedId") Integer lastFeedId,
                              @Param("lastLikeCount") Integer lastLikeCount,
                              @Param("lastCreatedAt") String lastCreatedAt,
                              @Param("size") int size);

    // 해당 DTO 정보 가져오기 (ID 기준)
    FeedDto selectFeedById(int id);

    // 해당 DTO 정보 가져오기 (지역기준)
    List<FeedDto> selectFeedByAddress(@Param("address") String Address, @Param("id") int id);

    // 내가 작성한 게시물 가져오기
    List<FeedThumbnailDto> selectMyFeeds(String nickname);

    // 좋아요 누른 게시물 가져오기
    List<FeedThumbnailDto> selectLikedFeeds(String nickname);

    // 팔로우한 사람들 게시물 가져오기
    List<FeedThumbnailDto> selectRecommendedFeeds(String nickname);

    // 좋아요 숫자 1추가
    int increaseLikeCount(int feedId);

    // 좋아요 숫자 1차감
    int decreaseLikeCount(int feedId);

    // 현재 좋아요 수 조회
    int selectLikeCount(int feedId);
}
