package dev.dhkim.petlog.mappers.shop;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Map;

@Mapper
public interface OrderMapper {
    void insertOrder(Map<String, Object> order);
    void insertOrderItem(Map<String, Object> item);
    void deductPoint(@Param("userId") int userId, @Param("amount") int amount, @Param("orderId") int orderId);
    void useCoupon(@Param("userCouponId") int userCouponId, @Param("orderId") int orderId);
    void earnPoint(@Param("userId") int userId, @Param("amount") int amount, @Param("orderId") int orderId);
    Map<String, Object> selectOrdererInfo(@Param("userId") int userId);
}