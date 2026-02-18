package dev.dhkim.petlog.controllers.feed;

import dev.dhkim.petlog.dto.feed.FeedDto;
import dev.dhkim.petlog.dto.feed.FeedScrollDto;
import dev.dhkim.petlog.dto.feed.FeedThumbnailDto;
import dev.dhkim.petlog.results.Result;
import dev.dhkim.petlog.services.feed.FeedCommandService;
import dev.dhkim.petlog.services.feed.FeedFollowService;
import dev.dhkim.petlog.services.feed.FeedLikeService;
import dev.dhkim.petlog.services.feed.FeedQueryService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feed")
@RequiredArgsConstructor
public class FeedApiController {

    private final FeedQueryService feedQueryService;
    private final FeedCommandService feedCommandService;
    private final FeedLikeService feedLikeService;
    private final FeedFollowService feedFollowService;

    // 무한 스크롤 요청 (/feed/explore)
    // 피드 조회
    @RequestMapping(method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public FeedScrollDto getFeeds(@RequestParam(defaultValue = "latest") String sort,
                                  @RequestParam(required = false) Integer lastFeedId,
                                  @RequestParam(required = false) Integer lastLikeCount,
                                  @RequestParam(required = false) String lastCreatedAt,
                                  @RequestParam(defaultValue = "20") int size,
                                  @SessionAttribute(value = "userId", required = false) Integer userId
    ) {
        return feedQueryService.getFeeds(sort, lastFeedId, lastLikeCount, lastCreatedAt, size, userId);
    }

    // 상세페이지(/feed/detail) 로딩
    @RequestMapping(value = "/{id}/related", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public List<FeedDto> getRelatedFeeds(@PathVariable(value = "id") int feedId,
                                         @SessionAttribute(value = "userId", required = false) Integer userId) {
        return feedQueryService.getRelatedFeeds(feedId, userId);
    }

    // 피드 좋아요 기능
    @RequestMapping(value = "/{id}/like", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> toggleLike(@PathVariable int id,
                                          @SessionAttribute(value = "userId", required = false) Integer userId) {
        if (userId == null) {
            return Map.of("result", "LOGIN_REQUIRED"); // 로그인 안되어 있으면 리턴
        }

        Map<String, Object> result = feedLikeService.toggleLike(id, userId);
        return Map.of("result", "SUCCESS",
                "liked", result.get("liked"),
                "likeCount", result.get("likeCount")
        );
    }

    // 프로필 탭(작성) 전환 시 로딩 (/feed/profile)
    @RequestMapping(value = "/profile/{nickname}/write", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public List<FeedThumbnailDto> getMyFeeds(@PathVariable String nickname) {
        List<FeedThumbnailDto> myFeeds = feedQueryService.getMyFeeds(nickname);
        return myFeeds;
    }

    // 프로필 탭(좋아요) 전환 시 로딩 (/feed/profile)
    @RequestMapping(value = "/profile/{nickname}/like", method = RequestMethod.GET)
    public List<FeedThumbnailDto> getLikeFeeds(@PathVariable String nickname) {
        List<FeedThumbnailDto> likeFeeds = feedQueryService.getLikedFeeds(nickname);
        return likeFeeds;
    }

    // 프로필 탭(팔로우) 전환 시 로딩 (/feed/profile)
    @RequestMapping(value = "/profile/{nickname}/recommend", method = RequestMethod.GET)
    public List<FeedThumbnailDto> getRecommendedFeeds(@PathVariable String nickname) {
        List<FeedThumbnailDto> recommendFeeds = feedQueryService.getRecommendedFeeds(nickname);
        return recommendFeeds;
    }

    // 피드 생성 (게시하기)
    @RequestMapping(method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> postFeeds(HttpSession session,
                                         @RequestParam("files") List<MultipartFile> files,
                                         @RequestParam("types") List<String> types,
                                         @RequestParam("orders") List<Integer> orders,
                                         @RequestParam String title,
                                         @RequestParam String description
    ) {
        Integer userId = (Integer) session.getAttribute("userId");

        if (userId == null) {
            return Map.of("result", "result", "message", "로그인이 필요합니다.");
        }
        Result result = feedCommandService.createFeed(userId, files, types, orders, title, description);
        return Map.of("result", result);
    }

    // 팔로우 버튼 클릭 시 처리
    @RequestMapping(value = "/follow/{targetUserId}", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> postFollow(@PathVariable int targetUserId,
                                          @SessionAttribute(value = "userId", required = false) Integer userId
    ) {
        if (userId == null) {
            return Map.of("result", "LOGIN_REQUIRED");
        }
        // 팔로우 여부
        boolean following = feedFollowService.toggleFollow(userId, targetUserId);
        Map<String, Integer> follow = feedFollowService.getFollowCount(userId, targetUserId);


        return Map.of("result", "SUCCESS",
                "following", following,
                "followerCount", follow.get("followerCount"),
                "followingCount", follow.get("followingCount")
        );
    }

}