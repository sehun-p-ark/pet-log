package dev.dhkim.petlog.services.main;

import dev.dhkim.petlog.dto.user.StoreDto;
import dev.dhkim.petlog.entities.user.StoreEntity;
import dev.dhkim.petlog.mappers.main.StoreMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreMapper storeMapper;
    private final KakaoGeoCodingService kakaoGeoCodingService;

    // ================= DTO ↔ Entity 변환 =================
    private StoreEntity dtoToEntity(StoreDto dto) {
        return StoreEntity.builder()
                .storeName(dto.getStoreName())
                .category(dto.getCategory())
                .addressPrimary(dto.getAddressPrimary())
                .addressSecondary(dto.getAddressSecondary())
                .lat(dto.getLat())
                .lng(dto.getLng())
                .storePhone(dto.getStorePhone())
                .userId(dto.getUserId())
                .build();
    }

    private StoreDto entityToDto(StoreEntity entity) {
        return StoreDto.builder()
                .storeId(entity.getStoreId())
                .storeName(entity.getStoreName())
                .category(entity.getCategory())
                .addressPrimary(entity.getAddressPrimary())
                .addressSecondary(entity.getAddressSecondary())
                .lat(entity.getLat())
                .lng(entity.getLng())
                .storePhone(entity.getStorePhone())
                .userId(entity.getUserId())
                .build();
    }

    // ================= 가게 등록 =================
    @Transactional
    public StoreDto registerStore(StoreDto storeDto) {
        String fullAddress = storeDto.getAddressPrimary();
        if (storeDto.getAddressSecondary() != null && !storeDto.getAddressSecondary().isBlank()) {
            fullAddress += " " + storeDto.getAddressSecondary();
        }

        double[] latLng = kakaoGeoCodingService.getLatLng(fullAddress);
        if (latLng[0] == 0.0 && latLng[1] == 0.0) {
            latLng = generateRandomLatLng();
        }

        storeDto.setLat(latLng[0]);
        storeDto.setLng(latLng[1]);

        StoreEntity entity = dtoToEntity(storeDto);
        storeMapper.insert(entity);

        System.out.println("[DEBUG] 가게 등록 완료, entity=" + entity);
        return entityToDto(entity);
    }

    // ================= DB에 없는 좌표 채우기 =================
    @Transactional
    public void updateAllStoreLatLng() {
        List<StoreEntity> stores = storeMapper.selectAllStores();

        for (StoreEntity store : stores) {
            if (store.getLat() == null || store.getLng() == null || store.getLat() == 0.0 || store.getLng() == 0.0) {
                String fullAddress = store.getAddressPrimary();
                if (store.getAddressSecondary() != null && !store.getAddressSecondary().isBlank()) {
                    fullAddress += " " + store.getAddressSecondary();
                }

                double[] latLng = kakaoGeoCodingService.getLatLng(fullAddress);
                if (latLng[0] == 0.0 && latLng[1] == 0.0) {
                    latLng = generateRandomLatLng();
                }

                store.setLat(latLng[0]);
                store.setLng(latLng[1]);
                storeMapper.updateStoreLatLng(store.getStoreId(), latLng[0], latLng[1]);

                System.out.println("[DEBUG] 좌표 업데이트, storeId=" + store.getStoreId()
                        + ", lat=" + latLng[0] + ", lng=" + latLng[1]);
            }
        }
    }

    // ================= 임의 좌표 생성 =================
    private double[] generateRandomLatLng() {
        double centerLat = 35.8714; // 대구 중심
        double centerLng = 128.6014;

        double lat = centerLat + (Math.random() - 0.5) * 0.02;
        double lng = centerLng + (Math.random() - 0.5) * 0.02;

        System.out.println("[DEBUG] 임의 좌표 생성, lat=" + lat + ", lng=" + lng);
        return new double[]{lat, lng};
    }

    // ================= 조회 =================
    public List<StoreDto> getAllStores() {
        return storeMapper.selectAllStores().stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    public List<StoreDto> getStoresByCategory(String category) {
        return storeMapper.selectStoresByCategory(category).stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    // ================= 카테고리별 조회 또는 전체 =================
    public List<StoreEntity> getStoresByCategoryOrAll(String category) {
        List<StoreEntity> stores = (category == null || category.isBlank())
                ? storeMapper.selectAllStores()
                : storeMapper.selectStoresByCategory(category);

        for (StoreEntity store : stores) {
            if (store.getLat() == null || store.getLng() == null || store.getLat() == 0.0 || store.getLng() == 0.0) {
                String fullAddress = store.getAddressPrimary();
                if (store.getAddressSecondary() != null && !store.getAddressSecondary().isBlank()) {
                    fullAddress += " " + store.getAddressSecondary();
                }

                double[] latLng = kakaoGeoCodingService.getLatLng(fullAddress);
                if (latLng[0] == 0.0 && latLng[1] == 0.0) {
                    latLng = generateRandomLatLng();
                }

                store.setLat(latLng[0]);
                store.setLng(latLng[1]);
                storeMapper.updateStoreLatLng(store.getStoreId(), latLng[0], latLng[1]);
            }
        }

        return stores;
    }
}