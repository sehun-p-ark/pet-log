package dev.dhkim.petlog.controllers.main;

import dev.dhkim.petlog.dto.main.FriendDto;
import dev.dhkim.petlog.dto.main.FriendListDto;
import dev.dhkim.petlog.dto.user.PetDto;
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

/*    @GetMapping("/nearby")
    public List<PetDto> getNearbyFriends(
            @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser,
            @RequestParam("lat") double lat,
            @RequestParam("lng") double lng
    ) {
        if (sessionUser == null) {
            return List.of();
        }

        Integer userId = sessionUser.getUserId();  // 추가

        return friendService.getNearbyFriends(userId, lat, lng);
    }*/

    @GetMapping("/nearby")
    public List<FriendListDto> getNearbyFriends( // DTO 이름을 NearbyFriendDto로 통일 권장
                                             @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser,
                                             @RequestParam("lat") double lat,
                                             @RequestParam("lng") double lng
    ) {
        if (sessionUser == null) return List.of();

        Integer userId = sessionUser.getUserId();

        // [중요] 좌표가 제대로 들어오는지 디버깅 로그 한 줄 추가
        System.out.println("컨트롤러 좌표 수신: lat=" + lat + ", lng=" + lng);

        return friendService.getNearbyFriends(userId, lat, lng);
    }
}