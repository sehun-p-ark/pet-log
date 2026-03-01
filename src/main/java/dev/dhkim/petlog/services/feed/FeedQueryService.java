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

    /* ===== 통합: 무한스크롤 + 검색 ===== */

    public FeedScrollDto getFeeds(String sort,
                                  String keyword,
                                  Integer lastFeedId,
                                  Integer lastLikeCount,
                                  String lastCreatedAt,
                                  int size,
                                  Integer userId) {
        // sort 정규화
        // ROOT : 사용자 언어에 따라 달라질 수 있음으로 언어 독립적, 중립 로케일 사용
        sort = (sort == null) ? "latest" : sort.trim().toLowerCase(java.util.Locale.ROOT);
        if (!sort.equals("latest") && !sort.equals("like")) {
            sort = "latest";
        }
        // keyword 정규화
        if (keyword != null && keyword.trim().isBlank()) {
            keyword = null;
        }

        // 피드를 불러오기 sort, keyword에 따라 21개를 조회
        // 그리고 21번째 피드의 (id, likeCount || createdAt)을 조회 -> 추후에 거기서부터 로딩하기 위함
        List<FeedDto> feedList =
                feedMapper.selectFeeds(
                        sort,
                        keyword,
                        lastFeedId,
                        lastLikeCount,
                        lastCreatedAt,
                        size + 1
                );

        boolean hasNext = feedList.size() > size; // 방금 조회한 피드들의 갯수가 size보다 많은지 여부(남은 피드 여부)

        if (hasNext) {
            feedList.remove(size); // 마지막 피드 제거
        }

        if (feedList.isEmpty()) { // 만약 조회한게 없다? null 반환
            return FeedScrollDto.builder()
                    .feedDtos(Collections.emptyList())
                    .lastFeedId(null)
                    .lastLikeCount(null)
                    .lastCreatedAt(null)
                    .hasNext(false)
                    .build();
        }

        // 미디어 붙이기
        feedMediaService.addMediaToFeed(feedList);

        // 주소 도시로 가공
        applyCityAddress(feedList);

        // 좋아요 상태 적용
        applyLikedStatus(feedList, userId);

        FeedDto lastFeed = feedList.get(feedList.size() - 1); // 마지막 피드 조회

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

    /* ===== 디테일 좌측 - 같은 지역 피드 ===== */

    public List<FeedDto> getRelatedFeeds(int feedId, Integer userId) {
        if (feedId <0) {
            return List.of();
        }

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

    /* ===== 디테일 우측 영역 ===== */

    public FeedDetailDto getFeedDetail(int feedId, Integer userId) {

        if (feedId <= 0) {
            return null;
        }

        FeedDto feed = feedMapper.selectFeedById(feedId); // feedId에 따른 피드 조회
        if (feed == null) return null;

        List<FeedMediaEntity> mediaList =
                feedMediaMapper.selectMediaByFeedId(feedId); // feedId에 따른 미디어 조회

        List<FeedMediaDto> mediaDtos = toMediaDtos(mediaList); // Entity를 List<dto>로

        boolean liked = false;
        boolean write = false;

        if (userId != null) {
            // 로그인한 상태면 피드 좋아요 여부 조회
            liked = feedLikeMapper.existsFeedLike(feedId, userId);
            // 해당 피드가 자신 게시물인지 여부 조회
            write = feed.getUserId() == userId;
        }

        List<FeedCommentDto> commentList =
                feedCommentMapper.selectCommentById(feedId); // feedId에 따른 댓글 조회 (댓글, 대댓글 전부)

        List<FeedCommentDto> commentTree =
                feedCommentService.buildCommentTree(commentList); // 부모 댓글과 대댓글의 관계 설정해주기

        for (FeedCommentDto parent : commentTree) { // 댓글 중 부모 반복문
            parent.setTimeAgo(TimeUtil.getTimeAgo(parent.getCreatedAt())); // 부모의 댓글 작성시간 ~전으로 통일
            for (FeedCommentDto reply : parent.getReplies()) { // 댓글 중 자식 반복문
                reply.setTimeAgo(TimeUtil.getTimeAgo(reply.getCreatedAt())); // 자식의 댓글 작성시간 ~전으로 통일
            }
        }

        return FeedDetailDto.builder() // 반환을 위해서 이제 최종DTO로 전부 종합
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

    /* ==============================
       수정 페이지
       ============================== */

    @Transactional(readOnly = true)
    public FeedDto getFeedForEdit(int feedId, int userId) {
        if (feedId <= 0 ) return null;

        FeedDto feed = feedMapper.selectFeedById(feedId); // 피드 조회

        if (feed == null)
            return null;

        if (feed.getUserId() != userId)
            return null;

        List<FeedMediaEntity> mediaList =
                feedMediaMapper.selectMediaByFeedId(feedId); // 피드 미디어 조회

        feed.setFeedMediaDtos(toMediaDtos(mediaList)); // feedDto 안의 MediaDtos에 조회한 mediaList 넣기

        return feed;
    }

    /* ==============================
       프로필 페이지
       ============================== */

    public List<FeedThumbnailDto> getMyFeeds(String nickname) {
        // 정규화
        if (nickname == null || nickname.trim().isBlank() || nickname.length() > 50) {
            return List.of();
        }
        List<FeedThumbnailDto> result = feedMapper.selectMyFeeds(nickname);
        return result == null ? List.of() : result;
    }

    public List<FeedThumbnailDto> getLikedFeeds(String nickname) {
        // 정규화
        if (nickname == null || nickname.trim().isBlank() || nickname.length() > 50) {
            return List.of();
        }
        List<FeedThumbnailDto> result = feedMapper.selectLikedFeeds(nickname);
        return result == null ? List.of() : result;
    }

    public List<FeedThumbnailDto> getRecommendedFeeds(String nickname) {
        // 정규화
        if (nickname == null || nickname.trim().isBlank() || nickname.length() > 50) {
            return List.of();
        }
        List<FeedThumbnailDto> result = feedMapper.selectRecommendedFeeds(nickname);
        return result == null ? List.of() : result;
    }

    /* ==============================
       공통 유틸
       ============================== */

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