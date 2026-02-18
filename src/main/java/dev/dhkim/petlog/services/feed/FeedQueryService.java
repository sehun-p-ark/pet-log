package dev.dhkim.petlog.services.feed;

import dev.dhkim.petlog.dto.feed.*;
import dev.dhkim.petlog.entities.feed.FeedMediaEntity;
import dev.dhkim.petlog.mappers.feed.FeedCommentMapper;
import dev.dhkim.petlog.mappers.feed.FeedLikeMapper;
import dev.dhkim.petlog.mappers.feed.FeedMapper;
import dev.dhkim.petlog.mappers.feed.FeedMediaMapper;
import dev.dhkim.petlog.utils.feed.AddressUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

    // 피드 페이지 FEED 조회
    // 로딩 찾아오기 (lastFeedId보다 작은 값, size갯수만큼, sort에 따라)
    public FeedScrollDto getFeeds(String sort,
                                  Integer lastFeedId,
                                  Integer lastLikeCount,
                                  String lastCreatedAt,
                                  int size,
                                  Integer userId
    ) {
        List<FeedDto> feedList = feedMapper.selectFeeds(sort, lastFeedId, lastLikeCount, lastCreatedAt, size + 1);

        boolean hasNext = feedList.size() > size; // size만큼 조회 후 다음 게시물 유무

        if (hasNext) { // hasNext가 있으면 -> 마지막 +1 조회했던거 지우기
            feedList.remove(size);
        }

        if (feedList.isEmpty()) { // 조회 결과가 비었으면?
            return FeedScrollDto.builder()
                    .feedDtos(Collections.emptyList()) // 빈 리스트
                    .lastFeedId(null) // 마지막 게시물 없음
                    .lastLikeCount(null)
                    .lastCreatedAt(null)
                    .hasNext(false) // 다음 게시물 없음
                    .build();
        }

        // 피드 ID에 해당하는 미디어 넣어주기
        feedMediaService.addMediaToFeed(feedList);
        // 피드 ID에 맞게 주소 넣기
        feedList.forEach(feed ->
                feed.setAddress(addressUtil.extractCity(feed.getAddress()))
        );

        // 좋아요 누른 게시물 전부 가져오기
        if (userId != null) {
            List<Integer> feedIds = feedList.stream()
                    .map(FeedDto::getFeedId)
                    .toList();

            List<Integer> likedFeedIds =
                    feedLikeMapper.selectLikedFeedIds(userId, feedIds); // 좋아요한 피드 아이디들만 가져옴

            Set<Integer> likedSet = new HashSet<>(likedFeedIds); // 아래에서 set.contains를 사용하기 위함 // List로 조회하면 성능 최악

            feedList.forEach(feed ->
                    feed.setLiked(likedSet.contains(feed.getFeedId()))  //getFeedId가 likedSet안에 포함되어 있으면 liked = true
            );
        }

        FeedDto lastFeed = feedList.get(feedList.size() - 1);
        Integer nextLastFeedId = hasNext ? lastFeed.getFeedId() : null; // 마지막 게시물 아이디 가져오기
        Integer nextLastLikeCount = null; // 마지막 게시물의 좋아요 수
        String nextLastCreatedAt = null; // 마지막 게시물의 생성일

        if (hasNext) {
            switch (sort) {
                case "like" -> nextLastLikeCount = lastFeed.getLikeCount(); // 인기순 -> 마지막 게시물의 좋아요 수
                case "latest" -> nextLastCreatedAt = lastFeed.getCreatedAt().toString(); // 최신순 -> 마지막 게시물의 생성일
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

    // 디테일 페이지 FEED 조회
    // 디테일 페이지 - 동일 지역 피드 조회 (좌측 영역)
    public List<FeedDto> getRelatedFeeds(int feedId, Integer userId) {

        FeedDto dbFeed = feedMapper.selectFeedById(feedId);
        if (dbFeed == null || dbFeed.getAddress() == null) return List.of();

        // 같은 지역 피드 조회 (현재 피드는 제외)
        List<FeedDto> relatedFeeds = feedMapper.selectFeedByAddress(dbFeed.getAddress(), feedId);
        if (relatedFeeds.isEmpty()) return relatedFeeds;

        // 피드 ID에 해당하는 미디어 넣어주기
        feedMediaService.addMediaToFeed(relatedFeeds);
        // 피드 ID에 맞게 주소 넣어주기
        relatedFeeds.forEach(f ->
                f.setAddress(addressUtil.extractCity(f.getAddress()))
        );

        // 좋아요 누른 게시물 전부 가져오기
        if (userId != null) {
            List<Integer> feedIds = relatedFeeds.stream()
                    .map(FeedDto::getFeedId)
                    .toList();

            List<Integer> likedFeedIds =
                    feedLikeMapper.selectLikedFeedIds(userId, feedIds); // 좋아요한 피드 아이디들만 가져옴

            Set<Integer> likedSet = new HashSet<>(likedFeedIds); // 아래에서 set.contains를 사용하기 위함 // List로 조회하면 성능 최악

            relatedFeeds.forEach(feed ->
                    feed.setLiked(likedSet.contains(feed.getFeedId()))  //getFeedId가 likedSet안에 포함되어 있으면 liked = true
            );
        }
        return relatedFeeds;
    }

    // 디테일 페이지
    // 디테일 페이지 - 선택한 피드 조회 (우측 영역)
    public FeedDetailDto getFeedDetail(int feedId, Integer userId) {
        // 1. 피드id를 통해서 피드의 작성자, 제목, 내용 찾음
        FeedDto feed = feedMapper.selectFeedById(feedId);
        if (feed == null) {
            return null;
        }
        // 2. 피드id를 통해서 피드의 미디어들을 찾음
        List<FeedMediaEntity> mediaList = feedMediaMapper.selectMediaByFeedId(feedId);
        // Entity -> DTO로 변환시키기
        List<FeedMediaDto> mediaDtos = mediaList.stream()
                .map(m -> FeedMediaDto.builder()
                        .mediaUrl(m.getMediaUrl())
                        .mediaType(m.getMediaType())
                        .sortOrder(m.getSortOrder())
                        .build())
                .toList();

        // 3. 게시물 좋아요 상태 확인
        boolean liked = false;
        if (userId != null) {
            liked = feedLikeMapper.existsFeedLike(feedId, userId);
        }


        // 4. 피드id를 통해서 피드의 댓글들을 찾음
        // 4-1. 댓글에서 유저의 닉네임, 대표 펫의 사진을 가져옴
        List<FeedCommentDto> commentList = feedCommentMapper.selectCommentById(feedId);
        List<FeedCommentDto> commentTree = feedCommentService.buildCommentTree(commentList);

        // 4. 이 모든걸 FeedDetailDto로 묶어서 controller로 보내주기
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
                .build();
    }

    // 프로필 페이지
    // 내가 쓴 FEED 조회 (기본 선택)
    public List<FeedThumbnailDto> getMyFeeds(String nickname) {
        List<FeedThumbnailDto> myFeeds = feedMapper.selectMyFeeds(nickname);
        return myFeeds == null ? List.of() : myFeeds;
    }

    // 프로필 페이지
    // 내가 좋아요 누른 FEED 조회
    public List<FeedThumbnailDto> getLikedFeeds(String nickname) {
        List<FeedThumbnailDto> likeFeeds = feedMapper.selectLikedFeeds(nickname);
        return likeFeeds == null ? List.of() : likeFeeds;
    }

    // 프로필 페이지
    // 내가 팔로우 한 사람들의 FEED 조회
    public List<FeedThumbnailDto> getRecommendedFeeds(String nickname) {
        List<FeedThumbnailDto> recommendFeeds = feedMapper.selectRecommendedFeeds(nickname);
        return recommendFeeds == null ? List.of() : recommendFeeds;
    }
}
