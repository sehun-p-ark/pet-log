package dev.dhkim.petlog.services.main;

import org.json.JSONObject;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
//카카오 서비스 키
import org.springframework.beans.factory.annotation.Value;


@Service
public class KakaoGeoCodingService {

    @Value("${kakao.rest.key}")
    private String kakaoRestKey;

    private final String GEO_URL = "https://dapi.kakao.com/v2/local/search/address.json?query=";

    public double[] getLatLng(String address) {
        try {

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoRestKey);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    GEO_URL + address,
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    String.class
            );

            JSONObject json = new JSONObject(response.getBody());
            if (json.getJSONArray("documents").length() == 0) {
                return new double[]{0.0, 0.0};
            }

            JSONObject doc = json.getJSONArray("documents").getJSONObject(0);
            double lat = doc.getDouble("y");
            double lng = doc.getDouble("x");

            return new double[]{lat, lng};

        } catch (Exception e) {
            e.printStackTrace();
            return new double[]{0.0, 0.0};
        }
    }
    // 💡 추가: 우편번호(zone_no) 가져오기 로직
    public String getPostalCode(String address) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoRestKey);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    GEO_URL + address,
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    String.class
            );

            JSONObject json = new JSONObject(response.getBody());
            if (json.getJSONArray("documents").length() == 0) {
                return "00000"; // 결과 없을 시 기본값
            }

            JSONObject doc = json.getJSONArray("documents").getJSONObject(0);

            // 도로명 주소(road_address)가 있으면 zone_no 추출, 없으면 지번 주소에서 확인
            if (!doc.isNull("road_address")) {
                return doc.getJSONObject("road_address").getString("zone_no");
            } else if (!doc.isNull("address")) {
                // 지번 주소 정보만 있을 경우 (일부 지역)
                return "00000";
            }

            return "00000";

        } catch (Exception e) {
            e.printStackTrace();
            return "00000";
        }
    }
}
