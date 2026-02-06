package dev.dhkim.petlog.mappers.shop;

import dev.dhkim.petlog.entities.shop.SubCategoryEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SubCategoryMapper {
    List<SubCategoryEntity> selectAll();
    List<SubCategoryEntity> selectByCategoryId(@Param("categoryId") Integer categoryId);
}
