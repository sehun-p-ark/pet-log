package dev.dhkim.petlog.controllers.shop;

import dev.dhkim.petlog.dto.user.SessionUser;
import dev.dhkim.petlog.services.shop.CouponService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/shop/coupon")
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/issue")
    public ResponseEntity<?> issueCoupon(
            @RequestParam int couponId,
            HttpSession session) {

        SessionUser sessionUser = (SessionUser) session.getAttribute("sessionUser");
        if (sessionUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요합니다."));
        }

        try {
            couponService.issueCoupon(sessionUser.getUserId(), couponId);
            return ResponseEntity.ok(Map.of("message", "쿠폰이 발급되었습니다."));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }
}