package dev.dhkim.petlog.services.feed;

import dev.dhkim.petlog.dto.feed.*;
import dev.dhkim.petlog.entities.feed.FeedMediaEntity;
import dev.dhkim.petlog.mappers.feed.*;
import dev.dhkim.petlog.utils.feed.AddressUtil;
import dev.dhkim.petlog.utils.feed.TimeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class FeedQueryService {

    private final FeedMapper feedMapper;
    private final FeedMediaMapper feedMediaMapper;
    private final FeedCommentMapper feedCommentMapper;
    private final FeedLikeMapper feedLikeMapper;
    private final FeedMediaService feedMediaService;
    private final FeedCommentService feedCommentService;
    private final AddressUtil addressUtil;

    /* ===== 무한스크롤 조회 ===== */

    public FeedScrollDto getFeeds(String sort,
                                  Integer lastFeedId,
                                  Integer lastLikeCount,
                                  String lastCreatedAt,
                                  int size,
                                  Integer userId) {

        List<FeedDto> feedList =
                feedMapper.selectFeeds(sort, lastFeedId, lastLikeCount, lastCreatedAt, size + 1);

        boolean hasNext = feedList.size() > size;

        if (hasNext) {
            feedList.remove(size);
        }

        if (feedList.isEmpty()) {
            return FeedScrollDto.builder()
                    .feedDtos(Collections.emptyList())
                    .lastFeedId(null)
                    .lastLikeCount(null)
                    .lastCreatedAt(null)
                    .hasNext(false)
                    .build();
        }

        feedMediaService.addMediaToFeed(feedList);
        applyCityAddress(feedList);
        applyLikedStatus(feedList, userId);

        FeedDto lastFeed = feedList.get(feedList.size() - 1);

        Integer nextLastFeedId = hasNext ? lastFeed.getFeedId() : null;
        Integer nextLastLikeCount = null;
        String nextLastCreatedAt = null;

        if (hasNext) {
            switch (sort) {
                case "like" -> nextLastLikeCount = lastFeed.getLikeCount();
                case "latest" -> nextLastCreatedAt = lastFeed.getCreatedAt().toString();
            }
        }

        return FeedScrollDto.builder()
                .feedDtos(feedList)
                .lastFeedId(nextLastFeedId)
                .lastLikeCount(nextLastLikeCount)
                .lastCreatedAt(nextLastCreatedAt)
                .hasNext(hasNext)
                .build();
    }

    /* ===== 디테일 좌측영역 - 같은 지역 피드 ===== */

    public List<FeedDto> getRelatedFeeds(int feedId, Integer userId) {

        FeedDto dbFeed = feedMapper.selectFeedById(feedId);
        if (dbFeed == null || dbFeed.getAddress() == null)
            return List.of();

        String city = addressUtil.extractCity(dbFeed.getAddress());
        if (city.isBlank())
            return List.of();

        List<FeedDto> relatedFeeds =
                feedMapper.selectFeedByAddress(city, feedId);

        if (relatedFeeds.isEmpty())
            return relatedFeeds;

        feedMediaService.addMediaToFeed(relatedFeeds);
        applyCityAddress(relatedFeeds);
        applyLikedStatus(relatedFeeds, userId);

        return relatedFeeds;
    }

    /* ===== 디테일페이지 우측영역 ===== */

    public FeedDetailDto getFeedDetail(int feedId, Integer userId) {

        FeedDto feed = feedMapper.selectFeedById(feedId);
        if (feed == null) return null;

        List<FeedMediaEntity> mediaList =
                feedMediaMapper.selectMediaByFeedId(feedId);

        List<FeedMediaDto> mediaDtos = toMediaDtos(mediaList);

        boolean liked = false;
        boolean write = false;

        if (userId != null) {
            liked = feedLikeMapper.existsFeedLike(feedId, userId);
            write = feed.getUserId() == userId;
        }

        List<FeedCommentDto> commentList =
                feedCommentMapper.selectCommentById(feedId);

        List<FeedCommentDto> commentTree =
                feedCommentService.buildCommentTree(commentList);

        for (FeedCommentDto parent : commentTree) {
            parent.setTimeAgo(TimeUtil.getTimeAgo(parent.getCreatedAt()));
            for (FeedCommentDto reply : parent.getReplies()) {
                reply.setTimeAgo(TimeUtil.getTimeAgo(reply.getCreatedAt()));
            }
        }

        return FeedDetailDto.builder()
                .feedId(feed.getFeedId())
                .userId(feed.getUserId())
                .profileImageUrl(feed.getProfileImageUrl())
                .nickname(feed.getNickname())
                .address(addressUtil.extractCity(feed.getAddress()))
                .title(feed.getTitle())
                .content(feed.getContent())
                .liked(liked)
                .likeCount(feed.getLikeCount())
                .commentCount(feed.getCommentCount())
                .feedMediaDtos(mediaDtos)
                .comments(commentTree)
                .isWriter(write)
                .build();
    }

    /* ===== 수정 페이지 ===== */

    @Transactional(readOnly = true)
    public FeedDto getFeedForEdit(int feedId, int userId) {

        FeedDto feed = feedMapper.selectFeedById(feedId);

        if (feed == null)
            throw new IllegalArgumentException("존재하지 않는 게시글");

        if (feed.getUserId() != userId)
            throw new SecurityException("수정 권한 없음");

        List<FeedMediaEntity> mediaList =
                feedMediaMapper.selectMediaByFeedId(feedId);

        feed.setFeedMediaDtos(toMediaDtos(mediaList));

        return feed;
    }

    /* ===== 프로필 페이지 ==== */

    // 내가 작성한 피드
    public List<FeedThumbnailDto> getMyFeeds(String nickname) {
        List<FeedThumbnailDto> result = feedMapper.selectMyFeeds(nickname);
        return result == null ? List.of() : result;
    }
    // 좋아요 누른 피드
    public List<FeedThumbnailDto> getLikedFeeds(String nickname) {
        List<FeedThumbnailDto> result = feedMapper.selectLikedFeeds(nickname);
        return result == null ? List.of() : result;
    }
    // 팔로우한 사람들 피드
    public List<FeedThumbnailDto> getRecommendedFeeds(String nickname) {
        List<FeedThumbnailDto> result = feedMapper.selectRecommendedFeeds(nickname);
        return result == null ? List.of() : result;
    }


    /* ===== 공통 유틸 메서드 ===== */

    private void applyCityAddress(List<FeedDto> feeds) {
        feeds.forEach(feed ->
                feed.setAddress(addressUtil.extractCity(feed.getAddress()))
        );
    }

    private void applyLikedStatus(List<FeedDto> feeds, Integer userId) {
        if (userId == null || feeds.isEmpty()) return;

        List<Integer> feedIds = feeds.stream()
                .map(FeedDto::getFeedId)
                .toList();

        List<Integer> likedFeedIds =
                feedLikeMapper.selectLikedFeedIds(userId, feedIds);

        Set<Integer> likedSet = new HashSet<>(likedFeedIds);

        feeds.forEach(feed ->
                feed.setLiked(likedSet.contains(feed.getFeedId()))
        );
    }

    private List<FeedMediaDto> toMediaDtos(List<FeedMediaEntity> mediaList) {
        return mediaList.stream()
                .map(m -> FeedMediaDto.builder()
                        .id(m.getId())
                        .feedId(m.getFeedId())
                        .mediaUrl(m.getMediaUrl())
                        .thumbnailUrl(m.getThumbnailUrl())
                        .mediaType(m.getMediaType())
                        .sortOrder(m.getSortOrder())
                        .build())
                .toList();
    }
}