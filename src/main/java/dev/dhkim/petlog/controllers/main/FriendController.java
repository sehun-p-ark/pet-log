package dev.dhkim.petlog.controllers.main;

import dev.dhkim.petlog.dto.main.FriendListDto;
import dev.dhkim.petlog.dto.user.SessionUser;
import dev.dhkim.petlog.services.main.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController   //  이걸로 변경
@RequiredArgsConstructor
@RequestMapping("/api/friends")  //  JS에 맞춤
public class FriendController {

    private final FriendService friendService;



    @GetMapping("/nearby")
    public List<FriendListDto> getNearbyFriends( // DTO 이름을 NearbyFriendDto로 통일 권장
                                             @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser,
                                             @RequestParam("lat") double lat,
                                             @RequestParam("lng") double lng
    ) {
        if (sessionUser == null) return List.of();

        Integer userId = sessionUser.getUserId();

        return friendService.getNearbyFriends(userId, lat, lng);
    }
}