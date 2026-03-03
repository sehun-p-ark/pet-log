package dev.dhkim.petlog.mappers.shop;

import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Map;

@Mapper
public interface CouponMapper {

    List<Map<String, Object>> getAvailableCoupons(int userId);


    List<Map<String, Object>> getUsedOrExpiredCoupons(@Param("userId") int userId);

    @Select("SELECT COUNT(*) FROM user_coupon WHERE user_id = #{userId} AND coupon_id = #{couponId}")
    int countUserCoupon(@Param("userId") int userId, @Param("couponId") int couponId);

    @Select("SELECT * FROM coupon WHERE id = #{couponId}")
    Map<String, Object> findCouponById(@Param("couponId") int couponId);

    @Insert("INSERT INTO user_coupon (user_id, coupon_id, status) VALUES (#{userId}, #{couponId}, 'AVAILABLE')")
    void insertUserCoupon(@Param("userId") int userId, @Param("couponId") int couponId);

    @Update("UPDATE coupon SET issued_quantity = issued_quantity + 1 WHERE id = #{couponId}")
    void incrementIssuedQuantity(@Param("couponId") int couponId);

    @Select("SELECT COUNT(*) FROM user_coupon WHERE user_id = #{userId} AND coupon_id = #{couponId} AND status = 'AVAILABLE'")
    int countAvailableUserCoupon(@Param("userId") int userId, @Param("couponId") int couponId);
}