package dev.dhkim.petlog.mappers.shop;

import dev.dhkim.petlog.entities.shop.CategoryEntity;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CategoryMapper {
    List<CategoryEntity> selectAll();
}
