package dev.dhkim.petlog.mappers.shop;

import dev.dhkim.petlog.entities.shop.CategoryEntity;
import dev.dhkim.petlog.entities.shop.SubCategoryEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SubCategoryMapper {
    SubCategoryEntity selectByDisplayText(@Param("displayText") String displayText);

    List<SubCategoryEntity> selectByCategoryId(Integer categoryId);

    List<CategoryEntity> selectMainCategories();
}