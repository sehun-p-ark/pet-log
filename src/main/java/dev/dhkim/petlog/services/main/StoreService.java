package dev.dhkim.petlog.services.main;

import com.fasterxml.jackson.databind.JsonNode;
import dev.dhkim.petlog.entities.user.StoreEntity;
import dev.dhkim.petlog.mappers.main.StoreMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreMapper storeMapper;
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String KAKAO_REST_KEY = "a4993f28bfdc1e9149e84e29a51993c0";

    /**
     * 주소 → 위도/경도 변환
     */
    private Double[] convertAddressToLatLng(String address) {
        try {
            String encodedAddress = URLEncoder.encode(address, StandardCharsets.UTF_8);
            String url = "https://dapi.kakao.com/v2/local/search/address.json?query=" + encodedAddress;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + KAKAO_REST_KEY);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<JsonNode> response =
                    restTemplate.exchange(url, HttpMethod.GET, entity, JsonNode.class);

            if (response.getBody() == null) return new Double[]{null, null};

            JsonNode docs = response.getBody().path("documents");
            if (docs.isEmpty()) return new Double[]{null, null};

            JsonNode doc = docs.get(0);
            double lng = doc.path("x").asDouble();
            double lat = doc.path("y").asDouble();
            return new Double[]{lat, lng};

        } catch (Exception e) {
            e.printStackTrace();
        }
        return new Double[]{null, null};
    }

    /**
     * 주소 조합
     */
    private String getFullAddress(StoreEntity store) {
        String fullAddress = store.getAddressPrimary();
        if (store.getAddressSecondary() != null && !store.getAddressSecondary().isBlank()) {
            fullAddress += " " + store.getAddressSecondary();
        }
        return fullAddress;
    }

    /**
     * DB에서 좌표 없는 데이터 조회 후 변환
     */
    @Transactional
    public void updateAllStoreLatLng() {
        List<StoreEntity> stores = storeMapper.findStoresWithoutCoords();

        for (StoreEntity store : stores) {
            String fullAddress = getFullAddress(store);
            Double[] coords = convertAddressToLatLng(fullAddress);

            if (coords[0] == null || coords[1] == null) {
                coords = generateRandomLatLng();
            }

            storeMapper.updateStoreLatLng(Map.of(
                    "storeId", store.getStoreId(),
                    "lat", coords[0],
                    "lng", coords[1]
            ));
        }
    }

    /**
     * 임의 좌표 생성 (대구 중심 근처)
     */
    private Double[] generateRandomLatLng() {
        double centerLat = 35.8714;
        double centerLng = 128.6014;
        double lat = centerLat + (Math.random() - 0.5) * 0.02;
        double lng = centerLng + (Math.random() - 0.5) * 0.02;
        return new Double[]{lat, lng};
    }

    // ================== 단일 엔드포인트용 메서드 ==================
    public List<StoreEntity> getStoresByCategoryOrAll(String category) {
        if (category == null || category.isBlank()) {
            return storeMapper.selectAllStores(); // 전체 조회
        }
        return storeMapper.selectStoresByCategory(category); // 카테고리 조회
    }
}


