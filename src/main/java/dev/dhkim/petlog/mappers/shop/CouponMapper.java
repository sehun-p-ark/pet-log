package dev.dhkim.petlog.mappers.shop;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface CouponMapper {

    List<Map<String, Object>> getAvailableCoupons(int userId);


    List<Map<String, Object>> getUsedOrExpiredCoupons(@Param("userId") int userId);
}