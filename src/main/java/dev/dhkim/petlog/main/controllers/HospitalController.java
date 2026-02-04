package dev.dhkim.petlog.main.controllers;

import dev.dhkim.petlog.main.services.HospitalService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@AllArgsConstructor
@RestController
@RequestMapping("/api")
public class HospitalController {

    private final HospitalService hospitalService;


    //  DB에 공공데이터 저장하는 API
    @GetMapping("/load-hospitals")
    public String loadHospitals() throws Exception {
        hospitalService.fetchAndSaveHospitals();
        return "병원 데이터 저장 완료";
    }



  /*  // DB 초기화
    @GetMapping("/delete-hospitals")
    public String deleteHospitals() {
        hospitalService.deleteAllHospitals();
        return "DB 모든 병원 데이터 삭제 완료";
    }*/
}