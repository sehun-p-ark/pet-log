package dev.dhkim.petlog.dto.main;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SalonDto {
    private String BIZPLC_NM; //병원 이름
    private String ROAD_NM_ADDR; // 도로명 주소
    private String ROAD_NM_ZIP; // 우편번호
    private String TELNO; // 전화번호
    private String SALS_STTS_NM; //영업상태
    private Double Lat;
    private Double Lng;
}
