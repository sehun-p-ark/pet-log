package dev.dhkim.petlog.main.controllers;

import dev.dhkim.petlog.main.services.SalonService;
import lombok.NoArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@NoArgsConstructor
@RequestMapping("/api")
@RestController
public class SalonController {
    private SalonService animalSalonService;


    @GetMapping("/salon")
    //프론트에서 병원 마크 클릭 하면 여기 api 데이터를 돌려줌
    // 지금은 100 개만 전체 데이터 출려면 서버에서 반복 돌려야 함
    public ResponseEntity<String> getSalons() throws Exception {

        String serviceKey = "d7e0beb3d81a4064f3ed977303249c76aa7241b310eb6acafcd84e66bda26176"; // Encoding Key
        String url = "https://apis.data.go.kr/1741000/pet_grooming/info"
                + "?serviceKey=" + serviceKey
                + "&page=1"
                + "&numOfRows=100"
                + "&returnType=json";

        RestTemplate restTemplate = new RestTemplate();
        String result = restTemplate.getForObject(url, String.class);

        return ResponseEntity.ok(result);
    }
}
