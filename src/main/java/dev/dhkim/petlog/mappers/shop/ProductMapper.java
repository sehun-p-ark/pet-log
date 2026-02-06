package dev.dhkim.petlog.mappers.shop;

import dev.dhkim.petlog.entities.shop.ProductEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ProductMapper {
    List<ProductEntity> selectAll();
    ProductEntity selectById(@Param("id") Integer id);
}
