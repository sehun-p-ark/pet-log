package dev.dhkim.petlog.services.main;

import org.json.JSONObject;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class KakaoGeoCodingService {

    private final String REST_API_KEY = "a4993f28bfdc1e9149e84e29a51993c0"; // 본인 키로 교체
    private final String GEO_URL = "https://dapi.kakao.com/v2/local/search/address.json?query=";

    public double[] getLatLng(String address) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + REST_API_KEY);
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
}
