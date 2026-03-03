package dev.dhkim.petlog.services.shop;

import dev.dhkim.petlog.entities.shop.AdvertisementEntity;
import dev.dhkim.petlog.mappers.shop.AdvertisementMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdvertisementService {
    private final AdvertisementMapper advertisementMapper;

    public List<AdvertisementEntity> getAdvertisements() {
        return advertisementMapper.findAll();
    }
}
