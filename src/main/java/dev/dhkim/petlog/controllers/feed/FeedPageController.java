package dev.dhkim.petlog.controllers.feed;

import ch.qos.logback.core.model.Model;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping(value="/feed")
public class FeedPageController {

    // 전체 피드
    @RequestMapping(value="/explore", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getExplore() {
        return "/feed/explore";
    }

    // 상세 피드
    @RequestMapping(value="/detail", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getDetail() {
        return "/feed/detail";
        //todo model 로 id 받아와서 각 페이지 할당 해줘야함
    }

    // 개인 프로필 피드
    @RequestMapping(value="/profile", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getProfile() {
        return "/feed/profile";
    }

    // 피드 작성하기
    @RequestMapping(value="/create", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getCreate() {
        return "/feed/create";
    }
}
