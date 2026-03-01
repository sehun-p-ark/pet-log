package dev.dhkim.petlog.controllers.feed;

import dev.dhkim.petlog.dto.feed.*;
import dev.dhkim.petlog.dto.user.SessionUser;
import dev.dhkim.petlog.results.CommonResult;
import dev.dhkim.petlog.results.Result;
import dev.dhkim.petlog.services.feed.*;
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
    private final FeedCommentService feedCommentService;

    // 무한 스크롤 요청 (/feed/explore)
    // 피드 조회
    @RequestMapping(method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public FeedScrollDto getFeeds(@RequestParam(defaultValue = "latest") String sort,
                                  @RequestParam(required = false) String keyword,
                                  @RequestParam(required = false) Integer lastFeedId,
                                  @RequestParam(required = false) Integer lastLikeCount,
                                  @RequestParam(required = false) String lastCreatedAt,
                                  @RequestParam(defaultValue = "20") int size,
                                  @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser
    ) {
        Integer userId = sessionUser != null ? sessionUser.getUserId() : null;
        return feedQueryService.getFeeds(sort, keyword, lastFeedId, lastLikeCount, lastCreatedAt, size, userId);
    }

    // 상세페이지(/feed/detail) 좌측페이지 로딩
    @RequestMapping(value = "/{id}/related", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public List<FeedDto> getRelatedFeeds(@PathVariable(value = "id") int feedId,
                                         @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        Integer userId = sessionUser != null ? sessionUser.getUserId() : null;
        return feedQueryService.getRelatedFeeds(feedId, userId);
    }

    // 피드 좋아요 기능
    @RequestMapping(value = "/{id}/like", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> toggleLike(@PathVariable int id,
                                          @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        if (sessionUser == null) {
            return Map.of("result", "LOGIN_REQUIRED"); // 로그인 안되어 있으면 리턴
        }
        Integer userId = sessionUser.getUserId();
        return feedLikeService.toggleLike(id, userId);
    }

    // 글쓰기 버튼 클릭 시 로그인 여부 확인
    @RequestMapping(value="/create-check", method=RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> checkCreate(@SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        if (sessionUser == null) {
            return Map.of("result", "LOGIN_REQUIRED");
        }
        return Map.of("result", CommonResult.SUCCESS);
    }

    // 프로필 탭(작성) 전환 시 로딩 (/feed/profile)
    @RequestMapping(value = "/profile/{nickname}/write", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public List<FeedThumbnailDto> getMyFeeds(@PathVariable String nickname) {
        return feedQueryService.getMyFeeds(nickname);
    }

    // 프로필 탭(좋아요) 전환 시 로딩 (/feed/profile)
    @RequestMapping(value = "/profile/{nickname}/like", method = RequestMethod.GET)
    public List<FeedThumbnailDto> getLikeFeeds(@PathVariable String nickname) {
        return feedQueryService.getLikedFeeds(nickname);
    }

    // 프로필 탭(팔로우) 전환 시 로딩 (/feed/profile)
    @RequestMapping(value = "/profile/{nickname}/recommend", method = RequestMethod.GET)
    public List<FeedThumbnailDto> getRecommendedFeeds(@PathVariable String nickname) {
        return feedQueryService.getRecommendedFeeds(nickname);
    }

    // 피드 생성 (게시하기)
    @RequestMapping(method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> postFeeds(@SessionAttribute(value = "sessionUser", required = false)SessionUser sessionUser,
                                         @RequestParam String title,
                                         @RequestParam String description,
                                         @RequestParam(value="files", required = false) List<MultipartFile> files,
                                         @RequestParam(value="newOrders", required = false) List<Integer> orders
    ) {
        if (sessionUser == null) {
            return Map.of("result", "LOGIN_REQUIRED");
        }
        Integer userId = sessionUser.getUserId();
        Result result = feedCommandService.createFeed(userId, title, description, files, orders);
        return Map.of("result", result);
    }

    // 피드 수정
    @RequestMapping(value="/{feedId}", method = RequestMethod.PUT, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> updateFeed(@PathVariable int feedId,
                                          @RequestParam String title,
                                          @RequestParam String description,
                                          @RequestParam(value="files", required = false) List<MultipartFile> files,
                                          @RequestParam(value="newOrders", required = false) List<Integer> newOrders,
                                          @RequestParam(value="keepMediaIds", required = false) List<Integer> keepMediaIds,
                                          @RequestParam(value="keepOrders", required = false) List<Integer> keepOrders,
                                          @SessionAttribute(value="sessionUser", required = false) SessionUser sessionUser
    ) {
        if (sessionUser == null) {
            return Map.of("result", "LOGIN_REQUIRED");
        }
        Integer userId = sessionUser.getUserId();
        Result result = feedCommandService.updateFeed(feedId, userId, title, description, files, newOrders, keepMediaIds, keepOrders);

        return Map.of("result", result);
    }

    // 피드 삭제
    @RequestMapping(value=("/{feedId}"), method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> deleteFeed(@PathVariable int feedId,
                                          @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        if (sessionUser == null) {
            return Map.of("result", "LOGIN_REQUIRED");
        }
        Integer userId = sessionUser.getUserId();
        Result result = feedCommandService.deleteFeed(feedId, userId);
        return Map.of("result", result);
    }

    // 팔로우 버튼 클릭 시 처리
    @RequestMapping(value = "/follow/{targetUserId}", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> postFollow(@PathVariable int targetUserId,
                                          @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser
    ) {
        if (sessionUser == null) {
            return Map.of("result", "LOGIN_REQUIRED");
        }
        Integer userId = sessionUser.getUserId();
        // 팔로우 여부
        boolean following = feedFollowService.toggleFollow(userId, targetUserId);
        Map<String, Integer> follow = feedFollowService.getFollowCount(userId, targetUserId);

        return Map.of("result", CommonResult.SUCCESS,
                "following", following,
                "followerCount", follow.get("followerCount"),
                "followingCount", follow.get("followingCount")
        );
    }

    // 댓글 작성
    @RequestMapping(value = "/{feedId}/comments", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> createComment(@PathVariable int feedId,
                                             @RequestBody Map<String, String> request,
                                             @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser
    ) {
        System.out.println("컨트롤러 진입");
        if (sessionUser == null) {
            return Map.of("result", "LOGIN_REQUIRED");
        }
        Integer userId = sessionUser.getUserId();
        String content = request.get("content");
        FeedCommentDto comment = feedCommentService.createComment(feedId, userId, content);
        return Map.of(
                "result", CommonResult.SUCCESS,
                "comment", comment
        );
    }

    // 대댓글 작성
    @RequestMapping(value = "{feedId}/comments/{commentId}/replies", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> createReply(
            @PathVariable int feedId,
            @PathVariable int commentId,
            @RequestBody Map<String, String> request,
            @SessionAttribute(value="sessionUser", required = false) SessionUser sessionUser
    ) {
        if (sessionUser == null) {
            return Map.of("result", "LOGIN_REQUIRED");
        }
        Integer userId = sessionUser.getUserId();
        String content = request.get("content");
        FeedCommentDto reply = feedCommentService.createReply(feedId, commentId, userId, content);
        return Map.of(
                "result", "SUCCESS",
                "reply", reply
        );
    }

    // 댓글 삭제
    @RequestMapping(value = "/{feedId}/comments/{commentId}", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> deleteComment(
            @PathVariable int feedId,
            @PathVariable int commentId,
            @SessionAttribute(value="sessionUser", required = false) SessionUser sessionUser
    ) {
        if (sessionUser == null) {
            return Map.of("result", "LOGIN_REQUIRED");
        }
        Integer userId = sessionUser.getUserId();
        feedCommentService.deleteComment(feedId, commentId, userId);
        return Map.of("result", "SUCCESS");
    }
}