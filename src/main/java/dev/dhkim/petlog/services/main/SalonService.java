package dev.dhkim.petlog.services.main;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.dhkim.petlog.dto.main.SalonDto;
import dev.dhkim.petlog.entities.main.SalonEntity;
import dev.dhkim.petlog.mappers.main.SalonMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
//카카오 서비스 키
import org.springframework.beans.factory.annotation.Value;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalonService {


    @Value("${kakao.rest.key}")
    private String kakaoRestKey;
    private final SalonMapper salonMapper;
    private final RestTemplate restTemplate = new RestTemplate(); // API 호출용
    private final ObjectMapper mapper = new ObjectMapper(); // JSON 파싱용

    private static final int NUM_OF_ROWS = 100;
    @Value("${public-data.service.key}")
    private String serviceKey;

    private String buildUrl(int pageNo) {
        return "https://apis.data.go.kr/1741000/pet_grooming/info"
                + "?serviceKey=" + serviceKey
                + "&pageNo=" + pageNo
                + "&numOfRows=" + NUM_OF_ROWS
                + "&returnType=json";
    }

    private JsonNode getBodyNode(int pageNo) throws Exception {
        String json = restTemplate.getForObject(buildUrl(pageNo), String.class);
        return mapper.readTree(json)
                .path("response")
                .path("body");
    }

    public int fetchAndSaveSalons() throws Exception {

        int totalSaved = 0;

        JsonNode firstBody = getBodyNode(1);
        int totalCount = firstBody.path("totalCount").asInt();
        int totalPages = (totalCount + NUM_OF_ROWS - 1) / NUM_OF_ROWS;

        for (int pageNo = 1; pageNo <= totalPages; pageNo++) {

            JsonNode body = getBodyNode(pageNo);
            JsonNode itemsNode = body.path("items").path("item");

            if (itemsNode.isMissingNode() || itemsNode.isNull()) {
                break;
            }

            List<SalonEntity> batch = new ArrayList<>();

            if (itemsNode.isArray()) {
                for (JsonNode node : itemsNode) {
                    batch.add(convertToEntity(node));
                }
            } else {
                batch.add(convertToEntity(itemsNode));
            }

            for (SalonEntity salon : batch) {

                if (!"영업/정상".equals(salon.getStatus()))
                    continue;

                if (salonMapper.existsByManageNo(salon.getManageNo()))
                    continue;

                insertSingleSalon(salon);
                totalSaved++;
            }
        }

        return totalSaved;
    }

    private SalonEntity convertToEntity(JsonNode node) {
        return SalonEntity.builder()
                .manageNo(node.path("MNG_NO").asText())
                .name(node.path("BPLC_NM").asText())
                .address(node.path("ROAD_NM_ADDR").asText())
                .phone(node.path("TELNO").asText())
                .status(node.path("SALS_STTS_NM").asText())
                .zipCode(node.path("ROAD_NM_ZIP").asText())
                .crdX(parseDoubleOrNull(node, "CRD_INFO_X"))
                .crdY(parseDoubleOrNull(node, "CRD_INFO_Y"))
                .build();
    }

    private Double parseDoubleOrNull(JsonNode node, String field) {
        String s = node.path(field).asText();
        return s.isBlank() ? null : Double.parseDouble(s);
    }

    public String deleteAllSalons() {
        salonMapper.deleteAllSalons();
        return "전체 삭제 완료";
    }

    /* =======================
       TM → WGS84 변환
       ======================= */

    private Double[] convertTmToLatLng(Double x, Double y) {

        try {

            String url = "https://dapi.kakao.com/v2/local/geo/transcoord.json"
                    + "?x=" + x
                    + "&y=" + y
                    + "&input_coord=WTM"
                    + "&output_coord=WGS84";

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoRestKey);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<JsonNode> response =
                    restTemplate.exchange(url, HttpMethod.GET, entity, JsonNode.class);


            JsonNode docs = response.getBody().path("documents");

            if (docs != null && docs.size() > 0) {

                JsonNode doc = docs.get(0);

                double lng = doc.path("x").asDouble();
                double lat = doc.path("y").asDouble();

                if (lat != 0.0 && lng != 0.0) {
                    return new Double[]{lat, lng};
                }
            }
        } catch (Exception e) {

            e.printStackTrace();
        }

        return new Double[]{null, null};
    }

    /* =======================
       전체 좌표 업데이트
       ======================= */

    @Transactional
    public void updateAllSalonsLatLng() {

        List<SalonEntity> salons = salonMapper.findInvalidCoords();

        int successCount = 0;
        int failCount = 0;
        int nullCoordCount = 0;
        int apiFailCount = 0;
        int updateZeroCount = 0;

        for (SalonEntity salon : salons) {

            try {

                Double x = salon.getCrdX();
                Double y = salon.getCrdY();

                if (x == null || y == null || x == 0.0 || y == 0.0) {
                    nullCoordCount++;
                    failCount++;
                    continue;
                }

                Double[] converted = convertTmToLatLng(x, y);

                Double lat = converted[0];
                Double lng = converted[1];

                if (lat == null || lng == null) {
                    apiFailCount++;
                    failCount++;
                    continue;
                }

                int updateResult = salonMapper.updateLatLng(
                        salon.getId(),
                        lat,
                        lng
                );

                if (updateResult == 1) {
                    successCount++;
                } else {
                    updateZeroCount++;
                    failCount++;
                }

            } catch (Exception e) {
                failCount++;
                e.printStackTrace();
            }
        }

    }

    /* =======================
       단일 insert (Lock 방지)
       ======================= */

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void insertSingleSalon(SalonEntity salon) {
        salonMapper.insertSalon(salon);
    }

    /* =======================
       지도용 조회
       ======================= */

    public List<SalonDto> getAllSalonsForMap() {

        return salonMapper.findAllActive()
                .stream()
                .map(s -> new SalonDto(
                        s.getName(),
                        s.getAddress(),
                        s.getPhone(),
                        s.getZipCode(),
                        s.getStatus(),
                        s.getLat(),
                        s.getLng()
                ))
                .collect(Collectors.toList());
    }
}