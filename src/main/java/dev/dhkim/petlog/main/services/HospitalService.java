package dev.dhkim.petlog.main.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.dhkim.petlog.main.entities.HospitalEntity;
import dev.dhkim.petlog.main.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.proj4j.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class HospitalService {

    private final HospitalRepository hospitalRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    private static final int NUM_OF_ROWS = 10;

    private static final String SERVICE_KEY = "d7e0beb3d81a4064f3ed977303249c76aa7241b310eb6acafcd84e66bda26176";
/*
    *//**
     * 전체 데이터 삭제 (테스트용)
     *//*
    public void deleteAllHospitals() {
        hospitalRepository.deleteAll();
        System.out.println("DB 모든 병원 데이터 삭제 완료");
    }*/


   /* 전체 데이터를 API에서 끝까지 긁어와 DB에 저장하는 메인 로직*/
    public int fetchAndSaveHospitals() throws Exception {
       //전체 저장 개수를 저장하는 변수
        int totalSaved = 0;

        // 1 첫 페이지에서 전체 건수 확인
        JsonNode firstBody = getBodyNode(1);
        //api에 totalCount": 10453 값에 접근
        int totalCount = firstBody.path("totalCount").asInt();
        int totalPages = (totalCount + NUM_OF_ROWS - 1) / NUM_OF_ROWS;

        System.out.println("총 데이터 수: " + totalCount);
        System.out.println("총 페이지 수: " + totalPages);

        // 2페이지 반복
        for (int pageNo = 1; pageNo <= totalPages; pageNo++) {

            JsonNode body = getBodyNode(pageNo);
            JsonNode itemsNode = body.path("items").path("item");

            // 🔥 item이 없거나 ""이면 중단 (API 버그 대응)
            if (itemsNode.isMissingNode() ||
                    itemsNode.isNull() ||
                    (itemsNode.isTextual() && itemsNode.asText().isEmpty())) {

                System.out.println("페이지 " + pageNo + " 데이터 없음 → 중단");
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

            hospitalRepository.saveAll(batch);
            totalSaved += batch.size();

            System.out.println("페이지 " + pageNo + " 저장 완료 (" + batch.size() + "건)");
        }

        System.out.println("전체 저장 완료: " + totalSaved + "건");
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

     // api 형태는 text 라서 crdX,crdY 값을 double 로 변환 해줘야 함
    //필드(json에 키 값)을 특정 하지말고 범용적으로 사용
    private Double parseDoubleOrNull(JsonNode node, String field){
        String s = node.path(field).asText();
        return s.isBlank() ? null : Double.parseDouble(s);
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
                + "?serviceKey=" + SERVICE_KEY
                + "&pageNo=" + pageNo
                + "&numOfRows=" + NUM_OF_ROWS
                + "&returnType=json";
    }

    private double[] convertTmToLatLng(double x, double y) {

        CRSFactory factory = new CRSFactory();

        // 한국 TM 좌표계 (공공데이터에서 주로 이거 씀)
        CoordinateReferenceSystem src = factory.createFromName("EPSG:5179");
        // GPS 위경도 좌표계
        CoordinateReferenceSystem dst = factory.createFromName("EPSG:4326");

        CoordinateTransformFactory ctFactory = new CoordinateTransformFactory();
        CoordinateTransform transform = ctFactory.createTransform(src, dst);

        ProjCoordinate srcCoord = new ProjCoordinate(x, y);
        ProjCoordinate dstCoord = new ProjCoordinate();

        transform.transform(srcCoord, dstCoord);

        return new double[]{dstCoord.y, dstCoord.x}; // [lat, lng]
    }


    //엔티티 값을 변환해서 위도 경도 업데이트 -> 이미 존재하는 hospital 객체 내부의 lat/lng 값을 채워 넣는 함수 = void
    public void updateLatLng(HospitalEntity hospital){

        Double x = hospital.getCrdX();
        Double y = hospital.getCrdY();

        if(x != null && y != null){
         double[] latlng = convertTmToLatLng(x,y);
         hospital.setCrdX(latlng[0]);
         hospital.setCrdX(latlng[1]);
         return;
        } else {

        }

    }
}
