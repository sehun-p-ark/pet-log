package dev.dhkim.petlog.services.shop;

import dev.dhkim.petlog.mappers.shop.CartMapper;
import dev.dhkim.petlog.mappers.shop.OrderMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderMapper orderMapper;
    private final CartMapper cartMapper;

    private int toInt(Object value) {
        if (value == null) return 0;
        if (value instanceof Number) return ((Number) value).intValue();
        return Integer.parseInt(value.toString().trim());
    }

    public void saveOrder(int userId, int finalAmount, Map<String, Object> orderInfo) {

        Map<String, Object> orderParam = new HashMap<>();
        orderParam.put("userId", userId);
        orderParam.put("ordererName", orderInfo.get("ordererName"));
        orderParam.put("ordererEmail", orderInfo.get("ordererEmail"));
        orderParam.put("ordererPhone", orderInfo.get("ordererPhone"));
        orderParam.put("receiverName", orderInfo.get("receiverName"));
        orderParam.put("receiverPhone", orderInfo.get("receiverPhone"));
        orderParam.put("addressPostal", orderInfo.get("postalCode"));
        orderParam.put("addressPrimary", orderInfo.get("addressPrimary"));
        orderParam.put("addressSecondary", orderInfo.get("addressSecondary"));
        orderParam.put("deliveryRequest", orderInfo.get("deliveryRequest"));
        orderParam.put("deliveryFee", toInt(orderInfo.get("deliveryFee")));
        orderParam.put("finalAmount", finalAmount);
        orderParam.put("usedCouponId", orderInfo.get("userCouponId"));
        orderParam.put("couponDiscount", toInt(orderInfo.get("couponDiscount")));
        orderParam.put("usedPoint", toInt(orderInfo.get("usedPoint")));
        orderParam.put("paymentMethod", orderInfo.get("paymentMethod"));
        orderParam.put("status", "PAID");

        orderMapper.insertOrder(orderParam);
        int orderId = ((Number) orderParam.get("id")).intValue();

        // 주문 아이템 저장
        List<Map<String, Object>> items = (List<Map<String, Object>>) orderInfo.get("items");
        for (Map<String, Object> item : items) {
            System.out.println("item: " + item);
            System.out.println("optionId: " + item.get("optionId") + ", type: " + (item.get("optionId") != null ? item.get("optionId").getClass() : "null"));
            item.put("orderId", orderId);
            orderMapper.insertOrderItem(item);
        }
        // 포인트 차감
        int usedPoint = toInt(orderInfo.get("usedPoint"));
        if (usedPoint > 0) {
            orderMapper.deductPoint(userId, usedPoint, orderId);
            orderMapper.updatePoint(userId, -usedPoint);
        }

        // 쿠폰 사용 처리
        Object userCouponIdObj = orderInfo.get("userCouponId");
        Integer userCouponId = (userCouponIdObj != null && !userCouponIdObj.toString().equals("null"))
                ? toInt(userCouponIdObj)
                : null;
        if (userCouponId != null) {
            orderMapper.useCoupon(userCouponId, orderId);
        }

        //적립 포인트(1%)
        int earnPoint = (int)(finalAmount * 0.01);
        if (earnPoint > 0) {
            orderMapper.earnPoint(userId, earnPoint, orderId);
            orderMapper.updatePoint(userId, earnPoint);
        }

        Object cartIdsObj = orderInfo.get("cartIds");
        if (cartIdsObj != null) {
            List<?> cartIdRaw = (List<?>) cartIdsObj;
            List<Integer> cartIds = cartIdRaw.stream()
                    .map(id -> ((Number) id).intValue())
                    .collect(java.util.stream.Collectors.toList());
            for (Integer cartId : cartIds) {
                cartMapper.deleteCartItem(cartId);
            }
        }
    }

    public Map<String, Object> getOrdererInfo(int userId) {
        return orderMapper.selectOrdererInfo(userId);
    }
}