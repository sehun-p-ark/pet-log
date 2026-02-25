package dev.dhkim.petlog.controllers.main;


import dev.dhkim.petlog.dto.main.HospitalDto;
import dev.dhkim.petlog.services.main.HospitalService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@AllArgsConstructor
@RestController
@RequestMapping("/api")
public class HospitalController {

    private final HospitalService hospitalService;

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

        return hospitalService.getAllHospitalsForMap(); // DB에서 DTO 리스트 반환
    }

}