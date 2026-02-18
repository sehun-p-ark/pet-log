package dev.dhkim.petlog.controllers.feed;

import dev.dhkim.petlog.services.feed.FeedDummyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/dev")
public class FeedDummyController {

    private final FeedDummyService feedDummyService;

    @PostMapping("/generate-feeds")
    public String generate(@RequestParam int count) {
        feedDummyService.generateDummyFeeds(count);
        return "더미 피드" + count + "개 생성 완료";
    }

}
