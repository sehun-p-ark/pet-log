package dev.dhkim.petlog.controllers.feed;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.dhkim.petlog.dto.feed.FeedDetailDto;
import dev.dhkim.petlog.dto.feed.FeedDto;
import dev.dhkim.petlog.dto.feed.ProfileDto;
import dev.dhkim.petlog.dto.user.SessionUser;
import dev.dhkim.petlog.services.feed.FeedProfileService;
import dev.dhkim.petlog.services.feed.FeedQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping(value="/feed")
@RequiredArgsConstructor
public class FeedPageController {

    private final FeedQueryService feedQueryService;
    private final FeedProfileService feedProfileService;

    // 전체 피드
    @RequestMapping(value="/explore", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getExplore(@SessionAttribute(value="sessionUser", required = false) SessionUser sessionUser,
                             Model model
    ) {
        if (sessionUser != null) { // 로그인 되어있으면
            Integer userId = sessionUser.getUserId();
            ProfileDto profile = feedProfileService.getProfile(userId);
            model.addAttribute("profile", profile); // 프로필 표시해주기
        }
        return "/feed/explore";
    }

    // 상세 피드 (우측 페이지)
    @RequestMapping(value="/{id}", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getDetail(@PathVariable(value="id") int feedId,
                            @SessionAttribute(value="sessionUser", required = false) SessionUser sessionUser,
                            Model model
    ) {
        Integer userId = sessionUser != null ? sessionUser.getUserId() : null; // 로그인 되어있으면 id 넣어주기
        FeedDetailDto feed = feedQueryService.getFeedDetail(feedId, userId);
        if(feed == null) {
            return "redirect:/feed/explore";
        }
        model.addAttribute("feed", feed);
        return "/feed/detail";
    }

    // 개인 프로필 피드
    @RequestMapping(value="/profile/{nickname}", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getProfile(@PathVariable String nickname,
                             @SessionAttribute(value="sessionUser", required = false) SessionUser sessionUser,
                             Model model
    ) {
        Integer userId = sessionUser != null ? sessionUser.getUserId() : null;
        ProfileDto profile = feedProfileService.getProfileView(nickname, userId);
        if (profile == null) {
            return "redirect:/feed/explore";
        }
        model.addAttribute("profile", profile);
        return "/feed/profile";
    }

    // 피드 작성하기 페이지
    @RequestMapping(value="/create", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getCreate(@SessionAttribute(value="sessionUser", required = false) SessionUser sessionUser,
                            Model model) {
        if (sessionUser == null) {
            return "redirect:/user/login";
        }
        model.addAttribute("mode", "create");
        return "/feed/create";
    }

    // 피드 수정하기 페이지
    @RequestMapping(value="/{feedId}/edit", method = RequestMethod.GET)
    public String getEdit(@PathVariable int feedId,
                          @SessionAttribute(value="sessionUser", required = false) SessionUser sessionUser,
                          Model model) {
        if (sessionUser == null) {
            return "redirect:/user/login";
        }
        Integer userId = sessionUser.getUserId();
        FeedDto feed = feedQueryService.getFeedForEdit(feedId, userId);

        if (feed == null) {
            return "redirect:/feed/" + feedId;
        }

        model.addAttribute("mode", "edit");
        model.addAttribute("feed", feed);
        model.addAttribute("mediaList", feed.getFeedMediaDtos());

        return "/feed/create"; //create 페이지 재사용
    }
}