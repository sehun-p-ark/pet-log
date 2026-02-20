package dev.dhkim.petlog.controllers.main;

import dev.dhkim.petlog.dto.user.SessionUser;
import dev.dhkim.petlog.services.main.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/follow")
public class FollowController {

    private final FollowService followService;

    @RequestMapping(
            value = "/toggle",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public boolean toggleFollow(
            @SessionAttribute("sessionUser") SessionUser user,
            @RequestParam("targetUserId") Integer targetUserId
    ) {
        return followService.toggleFollow(
                user.getUserId(),
                targetUserId
        );
    }
}
