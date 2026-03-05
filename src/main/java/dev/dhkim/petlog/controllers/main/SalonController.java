package dev.dhkim.petlog.controllers.main;

import dev.dhkim.petlog.dto.main.HospitalDto;
import dev.dhkim.petlog.dto.main.SalonDto;
import dev.dhkim.petlog.services.main.SalonService;
import dev.dhkim.petlog.services.main.StoreService;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@RequestMapping("/api")
@RestController
public class SalonController {
    private SalonService salonService;
    private StoreService storeService;



    @GetMapping("/delete")
    public String resetSalonData() {
        salonService.deleteAllSalons();
        return "테스트용 미용실 데이터 전체 삭제 완료";
    }


    //  DB에 공공데이터 저장하는 API
    @GetMapping("/load-salons")
    public String loadHospitals() throws Exception {
        salonService.fetchAndSaveSalons();
        return "미용실 데이터 저장 완료";
    }

    @GetMapping("/update-salons-coords")
    public String updateCoords() throws Exception {
        salonService.updateAllSalonsLatLng(); // 전체 샵 위경도 업데이트
        return "미용실 위도/경도 업데이트 완료!";
    }

    //미용실 목록 내보내기
    @GetMapping("/salon")
    public List<SalonDto> getSalon() {
        List<SalonDto> result = new ArrayList<>(salonService.getAllSalonsForMap());

        // store 테이블에서 카테고리 '미용실'인 것 합치기
        storeService.getStoresByCategory("미용실").forEach(s ->
                result.add(new SalonDto(
                        s.getStoreName(),
                        s.getAddressPrimary(),
                        s.getStorePhone(),
                        null,
                        "영업/정상",
                        s.getLat(),
                        s.getLng()
                ))
        );

        return result;
    }
}
