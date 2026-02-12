package dev.dhkim.petlog.services.main;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.dhkim.petlog.dto.main.HospitalDto;
import dev.dhkim.petlog.dto.main.SalonDto;
import dev.dhkim.petlog.entities.main.SalonEntity;
import dev.dhkim.petlog.mappers.SalonMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalonService {

    private final SalonMapper salonMapper;
    private final RestTemplate restTemplate = new RestTemplate(); // API 호출용
    private final ObjectMapper mapper = new ObjectMapper(); // JSON 파싱용

    private static final int NUM_OF_ROWS = 10;
    private static final String SERVICE_KEY = "d7e0beb3d81a4064f3ed977303249c76aa7241b310eb6acafcd84e66bda26176";
    private static final String KAKAO_REST_KEY = "a4993f28bfdc1e9149e84e29a51993c0";

    /* =======================
       공공데이터 API 호출 관련
       ======================= */

    /** API URL 생성 */
    private String buildUrl(int pageNo) {
        return "https://apis.data.go.kr/1741000/pet_grooming/info"
                + "?serviceKey=" + SERVICE_KEY
                + "&pageNo=" + pageNo
                + "&numOfRows=" + NUM_OF_ROWS
                + "&returnType=json";
    }

    /** 특정 페이지 body JSON 가져오기 */
    private JsonNode getBodyNode(int pageNo) throws Exception {
        String url = buildUrl(pageNo);
        String json = restTemplate.getForObject(url, String.class);
        return mapper.readTree(json)
                .path("response")
                .path("body");
    }

    /** API 데이터 가져와서 DB에 저장 */
    public int fetchAndSaveSalons() throws Exception {
        int totalSaved = 0;

        JsonNode firstBody = getBodyNode(1);
        int totalCount = firstBody.path("totalCount").asInt();
        int totalPages = (totalCount + NUM_OF_ROWS - 1) / NUM_OF_ROWS;

        System.out.println("총 데이터 수: " + totalCount);
        System.out.println("총 페이지 수: " + totalPages);

        for (int pageNo = 1; pageNo <= totalPages; pageNo++) {

            JsonNode body = getBodyNode(pageNo);
            JsonNode itemsNode = body.path("items").path("item");

            if (itemsNode.isMissingNode()
                    || itemsNode.isNull()
                    || (itemsNode.isTextual() && itemsNode.asText().isEmpty())) {
                System.out.println("페이지 " + pageNo + " 데이터 없음 → 중단");
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

            // 핵심: Lock 문제 예방을 위해 한 건씩 insert
            for (SalonEntity salon : batch) {

                // 중복 관리번호 체크
                if (salonMapper.existsByManageNo(salon.getManageNo())) {
                    continue;
                }

                insertSingleSalon(salon); // 한 건씩 새 트랜잭션으로 insert
                totalSaved++;
            }

            System.out.println("페이지 " + pageNo + " 저장 완료 (" + batch.size() + "건)");
        }

        System.out.println("전체 저장 완료: " + totalSaved + "건");
        return totalSaved;
    }

    /** SalonEntity 변환 */
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

    /** 문자열 → Double 변환, null 처리 */
    private Double parseDoubleOrNull(JsonNode node, String field) {
        String s = node.path(field).asText();
        return s.isBlank() ? null : Double.parseDouble(s);
    }

    /** DB 전체 삭제 */
    public String deleteAllSalons() {
        salonMapper.deleteAllSalons();
        return "DB 모든 샵 데이터 삭제 완료";
    }

    /* =======================
       좌표 변환 관련 (카카오 API)
       ======================= */

    /** TM 좌표 → WGS84 변환 */
    public Double[] convertTmToLatLng(Double x, Double y) {
        if (x == null || y == null) return new Double[]{0.0, 0.0};

        try {
            String url = "https://dapi.kakao.com/v2/local/geo/transcoord.json"
                    + "?x=" + x
                    + "&y=" + y
                    + "&input_coord=TM"
                    + "&output_coord=WGS84";

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + KAKAO_REST_KEY);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<JsonNode> response =
                    restTemplate.exchange(url, HttpMethod.GET, entity, JsonNode.class);

            JsonNode docs = response.getBody().path("documents");
            if (docs != null && docs.size() > 0) {
                JsonNode doc = docs.get(0);
                double lng = doc.path("x").asDouble();
                double lat = doc.path("y").asDouble();
                return new Double[]{lat, lng};
            }
        } catch (Exception e) {
            e.printStackTrace(); // API 호출 실패 시 로그
        }

        return new Double[]{0.0, 0.0};
    }

    /** 주소 → 위경도 검색 (카카오 주소 검색 API) */
    private double[] searchAddressToLatLng(String address) {
        if (address == null || address.isEmpty()) return new double[]{0.0, 0.0};

        String url = "https://dapi.kakao.com/v2/local/search/address.json?query=" + address;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + KAKAO_REST_KEY);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.GET, entity, JsonNode.class);
        JsonNode documents = response.getBody().path("documents");

        if (documents.size() > 0) {
            JsonNode doc = documents.get(0);
            double lng = doc.path("x").asDouble();
            double lat = doc.path("y").asDouble();
            return new double[]{lat, lng};
        }

        return new double[]{0.0, 0.0};
    }

    /** 단일 SalonEntity 위경도 업데이트 (TM 실패 시 주소 검색 fallback) */
    private void updateLatLng(SalonEntity salon) {
        Double x = salon.getCrdX();
        Double y = salon.getCrdY();

        double lat = 0.0;
        double lng = 0.0;

        try {
            // TM 좌표가 있는 경우 변환 시도
            if (x != null && y != null) {
                Double[] tmResult = convertTmToLatLng(x, y);

                // TM 변환 실패하면 fallback
                if (tmResult[0] != 0.0 || tmResult[1] != 0.0) {
                    lat = tmResult[0];
                    lng = tmResult[1];
                } else {
                    System.out.println("TM 좌표 변환 실패, 주소 검색으로 fallback: " + salon.getAddress());
                    double[] fallback = searchAddressToLatLng(salon.getAddress());
                    lat = fallback[0];
                    lng = fallback[1];
                }
            } else {
                // TM 좌표 없으면 주소 검색
                double[] fallback = searchAddressToLatLng(salon.getAddress());
                lat = fallback[0];
                lng = fallback[1];
            }
        } catch (Exception e) {
            System.out.println("좌표 변환 중 오류 발생, salon ID: " + salon.getId());
            e.printStackTrace();
        }

        salon.setLat(lat);
        salon.setLng(lng);
    }


    /** DB 전체 샵 위경도 변환 */
    @Transactional
    public void updateAllSalonsLatLng() {
        List<SalonEntity> salons = salonMapper.findInvalidCoords(0.0, 0.0);

        for (SalonEntity salon : salons) {
            try {
                updateLatLng(salon);
                salonMapper.updateLatLng(
                        salon.getId(),
                        salon.getLat(),
                        salon.getLng()
                );
            } catch (Exception e) {
                System.out.println("Failed to update salon ID: " + salon.getId());
                e.printStackTrace();
            }
        }
    }

    /* =======================
       Lock 문제 예방용 단일 insert
       ======================= */

    /**
     * 단일 SalonEntity를 DB에 insert
     * - 새 트랜잭션으로 insert
     * - Lock wait timeout 문제 예방
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void insertSingleSalon(SalonEntity salon) {
        try {
            salonMapper.insertSalon(salon); // 기존 매퍼 그대로 사용
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public List<SalonDto> getAllHospitalsForMap() {
        return salonMapper.findAll().stream()
                .map(s-> new SalonDto(
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
