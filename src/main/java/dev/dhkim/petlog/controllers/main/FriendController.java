package dev.dhkim.petlog.controllers.main;

import dev.dhkim.petlog.dto.user.PetDto;
import dev.dhkim.petlog.dto.user.SessionUser;
import dev.dhkim.petlog.services.main.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController   // 👈 이걸로 변경
@RequiredArgsConstructor
@RequestMapping("/api/friends")  // 👈 JS에 맞춤
public class FriendController {

    private final FriendService friendService;

    @GetMapping("/nearby")
    public List<PetDto> getNearbyFriends(
            @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser,
            @RequestParam("lat") double lat,
            @RequestParam("lng") double lng
    ) {
        if (sessionUser == null) {
            return List.of();
        }

        Integer userId = sessionUser.getUserId();  // 👈 추가

        return friendService.getNearbyFriends(userId, lat, lng);
    }
}