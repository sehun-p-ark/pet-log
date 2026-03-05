package dev.dhkim.petlog.controllers.main;


import dev.dhkim.petlog.dto.main.HospitalDto;
import dev.dhkim.petlog.services.main.HospitalService;
import dev.dhkim.petlog.services.main.StoreService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;


@AllArgsConstructor
@RestController
@RequestMapping("/api")
public class HospitalController {

    private final HospitalService hospitalService;
    private final StoreService storeService;

    @GetMapping("/test/hospital/reset")
    public String resetHospitalData() {
        hospitalService.deleteAllHospitals();
        return "테스트용 병원 데이터 전체 삭제 완료";
    }

    //  DB에 공공데이터 저장하는 API
    @GetMapping("/load-hospitals")
    public String loadHospitals() throws Exception {
        hospitalService.fetchAndSaveHospitals();
        return "병원 데이터 저장 완료";
    }


    @GetMapping("/update-hospital-coords")
    public String updateCoords() throws Exception {
        hospitalService.updateAllHospitalsLatLng();
        return "병원 위도/경도 업데이트 완료!";
    }
    //병원 목록 내보내기
    @GetMapping("/hospital")
    public List<HospitalDto> getHospital() {
        List<HospitalDto> result = new ArrayList<>(hospitalService.getAllHospitalsForMap());

        // store 테이블에서 카테고리 '병원'인 것 합치기
        storeService.getStoresByCategory("병원").forEach(s ->
                result.add(new HospitalDto(
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