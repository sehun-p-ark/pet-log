package dev.dhkim.petlog.services.main;

import dev.dhkim.petlog.dto.user.StoreDto;
import dev.dhkim.petlog.entities.user.StoreEntity;
import dev.dhkim.petlog.mappers.main.StoreMapper;
import dev.dhkim.petlog.results.MyPageResult;
import dev.dhkim.petlog.validators.UserValidator;
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
                .storeId(dto.getStoreId()) //
                .storeName(dto.getStoreName())
                .category(dto.getCategory())
                .addressPrimary(dto.getAddressPrimary())
                .addressSecondary(dto.getAddressSecondary())
                .postalCode(dto.getPostalCode())
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

        // 1. 카카오 API로부터 좌표를 가져옴
        double[] latLng = kakaoGeoCodingService.getLatLng(fullAddress);

        // 2. 💡 추가: 카카오 API로부터 우편번호도 가져와서 세팅해야 함
        // (KakaoGeoCodingService에 getPostalCode 메서드가 있다고 가정하거나 추가해야 함)
        String zoneNo = kakaoGeoCodingService.getPostalCode(fullAddress);
        storeDto.setPostalCode(zoneNo);

        if (latLng[0] == 0.0 && latLng[1] == 0.0) {
            latLng = generateRandomLatLng();
        }

        storeDto.setLat(latLng[0]);
        storeDto.setLng(latLng[1]);

        StoreEntity entity = dtoToEntity(storeDto);
        storeMapper.insert(entity); //  이제 postal_code가 채워져서 에러가 안 날 겁니다.

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

            }
        }
    }

    // ================= 임의 좌표 생성 =================
    private double[] generateRandomLatLng() {
        double centerLat = 35.8714; // 대구 중심
        double centerLng = 128.6014;

        double lat = centerLat + (Math.random() - 0.5) * 0.02;
        double lng = centerLng + (Math.random() - 0.5) * 0.02;

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

    // StoreService 내부

    @Transactional
    public MyPageResult updateStore(StoreDto storeDto) {
        // 주소 합치기
        if (storeDto.getStoreId() < 1 ||
                !UserValidator.validateStoreForRegistration(storeDto) ||
                storeDto.getUserId() < 1) {
            System.out.println(storeDto.getStoreName());
            System.out.println(storeDto.getPostalCode());
            System.out.println(storeDto.getAddressPrimary());
            System.out.println(storeDto.getAddressSecondary());
            System.out.println(storeDto.getCategory());
            System.out.println(storeDto.getStorePhone());
            return MyPageResult.FAILURE;
        }
        String fullAddress = storeDto.getAddressPrimary().trim();



        double[] latLng = kakaoGeoCodingService.getLatLng(fullAddress);


        storeDto.setLat(latLng[0]);
        storeDto.setLng(latLng[1]);

        StoreEntity entity = dtoToEntity(storeDto);
        storeMapper.updateStore(entity);

        return storeMapper.updateStore(entity) > 0
                ? MyPageResult.SUCCESS
                : MyPageResult.FAILURE;

    }

    // StoreService 클래스 내부 최하단쯤에 있습니다.

    // 💡 등록과 수정에서 공통으로 사용할 메서드
    private void updateLatLngAndPostalCode(StoreDto dto) {
        // 주소 결합 (상세주소가 null일 경우를 대비해 처리)
        String fullAddress = dto.getAddressPrimary() + " " + (dto.getAddressSecondary() != null ? dto.getAddressSecondary() : "");

        // 카카오 Geocoder 호출 (이 서비스가 실제 좌표를 가져오는 핵심!)
        double[] latLng = kakaoGeoCodingService.getLatLng(fullAddress);
        String zoneNo = kakaoGeoCodingService.getPostalCode(fullAddress);

        // DTO에 결과 주입 (여기서 값이 바뀌어야 DB에 새 좌표가 들어감)
        dto.setLat(latLng[0]);
        dto.setLng(latLng[1]);
        dto.setPostalCode(zoneNo);
    }
} // 클래스 끝
