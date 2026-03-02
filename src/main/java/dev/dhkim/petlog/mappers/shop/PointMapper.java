package dev.dhkim.petlog.mappers.shop;

import dev.dhkim.petlog.entities.shop.PointEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PointMapper {
    int getAvailablePoint(@Param("userId") Integer userId);

    List<PointEntity> selectAllPointEarnByUserId(@Param(value = "userId") int userId);

    List<PointEntity> selectAllPointUseByUserId(@Param(value = "userId") int userId);
}
