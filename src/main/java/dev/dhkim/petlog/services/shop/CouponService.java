package dev.dhkim.petlog.services.shop;

import dev.dhkim.petlog.mappers.shop.CouponMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponMapper couponMapper;

    // 사용 가능한 쿠폰 목록 조회
    public List<Map<String, Object>> getAvailableCoupons(Integer userId) {
        if (userId == null) {
            return List.of();
        }
        return couponMapper.getAvailableCoupons(userId);
    }

    public void issueCoupon(int userId, int couponId) {
        Map<String, Object> coupon = couponMapper.findCouponById(couponId);
        if (coupon == null) {
            throw new IllegalStateException("존재하지 않는 쿠폰입니다.");
        }

        Integer totalQuantity = (Integer) coupon.get("total_quantity");
        Integer issuedQuantity = (Integer) coupon.get("issued_quantity");
        if (totalQuantity != null && issuedQuantity >= totalQuantity) {
            throw new IllegalStateException("쿠폰이 모두 소진되었습니다.");
        }

        Integer couponLimit = (Integer) coupon.get("coupon_limit");
        if (couponLimit != null) {
            int count;
            if (couponLimit == 1) {
                count = couponMapper.countUserCoupon(userId, couponId);
            } else {
                count = couponMapper.countAvailableUserCoupon(userId, couponId);
            }
            if (count >= couponLimit) {
                throw new IllegalStateException(couponLimit == 1
                        ? "이미 발급받은 쿠폰입니다."
                        : "보유 중인 쿠폰을 모두 사용 후 다시 받을 수 있습니다.");
            }
        }

        couponMapper.insertUserCoupon(userId, couponId);
        couponMapper.incrementIssuedQuantity(couponId);
    }
}