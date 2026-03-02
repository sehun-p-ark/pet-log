package dev.dhkim.petlog.controllers.shop;

import dev.dhkim.petlog.dto.user.SessionUser;
import dev.dhkim.petlog.mappers.shop.HeartMapper;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/shop")
public class HeartController {

    @Autowired
    private HeartMapper heartMapper;

    // 찜하기/취소 토글
    @PostMapping("/heart/{productId}")
    public Map<String, Object> toggleHeart(@PathVariable int productId,
                                           @SessionAttribute(value ="sessionUser", required = false) SessionUser sessionUser) {
        if (sessionUser == null) {
            return Map.of("success", false, "message", "로그인이 필요합니다");
        }
        Integer userId = sessionUser.getUserId();
        System.out.println(sessionUser);


        Integer existing = heartMapper.checkHeart(userId, productId);

        if (existing != null) {
            heartMapper.deleteHeart(userId, productId);
            return Map.of("success", true, "isHearted", false);
        } else {
            heartMapper.insertHeart(userId, productId);
            return Map.of("success", true, "isHearted", true);
        }
    }

    // 찜 상태 확인
    @GetMapping("/heart/{productId}/status")
    public Map<String, Object> checkHeartStatus(@PathVariable int productId,
                                                @SessionAttribute(value ="sessionUser", required = false)SessionUser sessionUser) {

        if (sessionUser == null) {
            return Map.of("isHearted", false);
        }
        Integer userId = sessionUser.getUserId();


        Integer existing = heartMapper.checkHeart(userId, productId);
        return Map.of("isHearted", existing != null);
    }
}