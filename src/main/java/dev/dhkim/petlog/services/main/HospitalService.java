package dev.dhkim.petlog.services.main;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.dhkim.petlog.dto.main.HospitalDto;
import dev.dhkim.petlog.entities.main.HospitalEntity;
import dev.dhkim.petlog.mappers.main.HospitalMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
//카카오 서비스 키
import org.springframework.beans.factory.annotation.Value;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class HospitalService {

    @Value("${kakao.rest.key}")
    private String kakaoRestKey;
    private final HospitalMapper hospitalMapper;
    //공공데이터 API 자체를 호출할 수 없음
    private final RestTemplate restTemplate = new RestTemplate();
    //json 문자 -> 자바로 파싱
    private final ObjectMapper mapper = new ObjectMapper();

    private static final int NUM_OF_ROWS = 100;

    @Value("${public-data.service.key}")
    private String serviceKey;


    /**
     * 전체 데이터 삭제 (테스트용)
     */
    public String deleteAllHospitals() {
        hospitalMapper.deleteAllHospitals();
        return "DB 모든 병원 데이터 삭제 완료";
    }


    public int fetchAndSaveHospitals() throws Exception {

        int totalSaved = 0;

        JsonNode firstBody = getBodyNode(1);
        int totalCount = firstBody.path("totalCount").asInt();
        int totalPages = (totalCount + NUM_OF_ROWS - 1) / NUM_OF_ROWS;


        for (int pageNo = 1; pageNo <= totalPages; pageNo++) {

            JsonNode body = getBodyNode(pageNo);
            JsonNode itemsNode = body.path("items").path("item");

            if (itemsNode.isMissingNode()
                    || itemsNode.isNull()
                    || (itemsNode.isTextual() && itemsNode.asText().isEmpty())) {
                break;
            }

            List<HospitalEntity> batch = new ArrayList<>();

            if (itemsNode.isArray()) {
                for (JsonNode node : itemsNode) {
                    batch.add(convertToEntity(node));
                }
            } else {
                batch.add(convertToEntity(itemsNode));
            }

            // 여기 핵심
            for (HospitalEntity hospital : batch) {

                // 🚫 폐업 / 영업정지 제외
                if (!"영업/정상".equals(hospital.getStatus())) {
                    continue;
                }

                // 중복 체크
                if (hospitalMapper.existsByManageNo(hospital.getManageNo())) {
                    continue;
                }
                hospitalMapper.insertHospital(hospital);
                totalSaved++;
            }
        }

        return totalSaved;
    }
    //“API에서 받은 JSON 병원 1건 → DB에 저장할 HospitalEntity 객체로 변환
    private HospitalEntity convertToEntity(JsonNode node) {
        return HospitalEntity.builder()
                .manageNo(node.path("MNG_NO").asText())
                .name(node.path("BPLC_NM").asText())
                .address(node.path("ROAD_NM_ADDR").asText())
                .phone(node.path("TELNO").asText())
                .status(node.path("SALS_STTS_NM").asText())
                .zipCode(node.path("ROAD_NM_ZIP").asText())
                //문자열 → 자바 숫자 타입으로 변환해서 → DB 숫자 컬럼에 넣는 과정
                .crdX(parseDoubleOrNull(node, "CRD_INFO_X"))
                .crdY(parseDoubleOrNull(node, "CRD_INFO_Y"))
                .lat(0.0)
                .lng(0.0)
                .build();
    }


    /**
     * 특정 페이지 body JSON 가져오기
     */
    private JsonNode getBodyNode(int pageNo) throws Exception {
        String url = buildUrl(pageNo);
        String json = restTemplate.getForObject(url, String.class);

        return mapper.readTree(json)
                .path("response")
                .path("body");
    }

    /**
     * API URL 생성
     */
    private String buildUrl(int pageNo) {
        return "https://apis.data.go.kr/1741000/animal_hospitals/info"
                + "?serviceKey=" + serviceKey
                + "&pageNo=" + pageNo
                + "&numOfRows=" + NUM_OF_ROWS
                + "&returnType=json";
    }

    // api 형태는 text 라서 crdX,crdY 값을 double 로 변환 해줘야 함
    //필드(json에 키 값)을 특정 하지말고 범용적으로 사용
    private Double parseDoubleOrNull(JsonNode node, String field) {
        String s = node.path(field).asText();
        return s.isBlank() ? null : Double.parseDouble(s);
    }


    /**
     * TM 좌표(EPSG:5179) → WGS84 변환 (카카오 Local API)
     */
    private double[] convertTmToLatLng(double x, double y) {
        String url = "https://dapi.kakao.com/v2/local/geo/transcoord.json"
                + "?x=" + x
                + "&y=" + y
                + "&input_coord=TM"
                + "&output_coord=WGS84";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + kakaoRestKey);// REST API Key
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<JsonNode> response =
                restTemplate.exchange(url, HttpMethod.GET, entity, JsonNode.class);

        JsonNode docs = response.getBody().path("documents");
        if (docs != null && docs.size() > 0) {
            JsonNode doc = docs.get(0);
            double lng = doc.path("x").asDouble();
            double lat = doc.path("y").asDouble();
            return new double[]{lat, lng};
        }

        return new double[]{0.0, 0.0};
    }

    /**
     * 주소 → 위경도 검색 (Kakao 주소 검색 API)
     */
    private double[] searchAddressToLatLng(String address) {
        if (address == null || address.isEmpty()) return new double[]{0.0, 0.0};

        String url = "https://dapi.kakao.com/v2/local/search/address.json?query=" + address;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + "a4993f28bfdc1e9149e84e29a51993c0");
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.GET, entity, JsonNode.class);
        JsonNode documents = response.getBody().path("documents");

        if (documents.size() > 0) {
            JsonNode doc = documents.get(0);
            double lng = doc.path("x").asDouble();
            double lat = doc.path("y").asDouble();
            return new double[]{lat, lng};
        }

        return new double[]{0.0, 0.0}; // 실패 시 0,0
    }

    /**
     * 단일 병원 위경도 업데이트
     */
    private void updateLatLng(HospitalEntity hospital) {
        Double x = hospital.getCrdX();
        Double y = hospital.getCrdY();

        double lat, lng;

        if (x != null && y != null) {
            // TM 좌표 → WGS84 변환
            double[] latlng = convertTmToLatLng(x, y);
            lat = latlng[0];
            lng = latlng[1];
        } else {
            // 좌표 없으면 주소 검색
            double[] latlng = searchAddressToLatLng(hospital.getAddress());
            lat = latlng[0];
            lng = latlng[1];
        }

        hospital.setLat(lat);
        hospital.setLng(lng);
    }

    /**
     * DB 전체 병원 데이터 위도 경도 변환
     */
    @Transactional
    public void updateAllHospitalsLatLng() {

        List<HospitalEntity> hospitals =
                hospitalMapper.findInvalidCoords(0.0, 0.0);

        for (HospitalEntity hospital : hospitals) {
            try {
                updateLatLng(hospital);
                hospitalMapper.updateLatLng(
                        hospital.getId(),
                        hospital.getLat(),
                        hospital.getLng()
                );
            } catch (Exception e) {
                System.out.println("Failed to update hospital ID: " + hospital.getId());
                e.printStackTrace();
            }
        }

    }

    //백에서 받은 값을 프론트로 전달
        public List<HospitalDto> getAllHospitalsForMap() {
            return hospitalMapper.findAll().stream()
                    .map(h -> new HospitalDto(
                            h.getName(),
                            h.getAddress(),
                            h.getPhone(),
                            h.getZipCode(),
                            h.getStatus(),
                            h.getLat(),
                            h.getLng()
                    ))
                    .collect(Collectors.toList());
        }

    }


