package dev.dhkim.petlog.controllers.feed;

import dev.dhkim.petlog.dto.feed.FeedDetailDto;
import dev.dhkim.petlog.dto.feed.ProfileDto;
import dev.dhkim.petlog.dto.user.SessionUser;
import dev.dhkim.petlog.services.feed.FeedProfileService;
import dev.dhkim.petlog.services.feed.FeedQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.SessionAttribute;

@Controller
@RequestMapping(value="/feed")
@RequiredArgsConstructor
public class FeedPageController {

    private final FeedQueryService feedQueryService;
    private final FeedProfileService feedProfileService;

    // 전체 피드
    @RequestMapping(value="/explore", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getExplore(@SessionAttribute(value="userId", required = false) Integer userId,
                             Model model
    ) {
        if (userId != null) {
            ProfileDto profile = feedProfileService.getProfile(userId);
            model.addAttribute("profile", profile);
        }
        return "/feed/explore";
    }

    // 상세 피드
    @RequestMapping(value="/{id}", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getDetail(@PathVariable(value="id") int feedId,
                            @SessionAttribute(value="sessionUser", required = false) SessionUser sessionUser,
                            Model model
    ) {
        FeedDetailDto feed = feedQueryService.getFeedDetail(feedId, sessionUser.getUserId());
        if(feed == null) {
            return "redirect:/feed/explore";
        }
        model.addAttribute("feed", feed);
        return "/feed/detail";
    }

    // 개인 프로필 피드
    @RequestMapping(value="/profile/{nickname}", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getProfile(@PathVariable String nickname,
                             @SessionAttribute(value="userId", required = false) Integer userId,
                             Model model
    ) {
        ProfileDto profile = feedProfileService.getProfileView(nickname, userId);
        if (profile == null) {
            return "redirect:/feed/explore";
        }
        model.addAttribute("profile", profile);
        return "/feed/profile";
    }

    // 피드 작성하기
    @RequestMapping(value="/create", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getCreate() {
        return "/feed/create";
    }
}
