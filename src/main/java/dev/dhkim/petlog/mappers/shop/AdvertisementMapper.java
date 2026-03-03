package dev.dhkim.petlog.mappers.shop;

import dev.dhkim.petlog.entities.shop.AdvertisementEntity;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface AdvertisementMapper {
    List<AdvertisementEntity> findAll();
}
