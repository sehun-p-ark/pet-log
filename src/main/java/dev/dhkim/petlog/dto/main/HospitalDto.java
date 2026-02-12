package dev.dhkim.petlog.dto.main;

import lombok.AllArgsConstructor;
import lombok.Getter;
//프론트랑 서버랑 연결해주는 역할(화면에 표시할거임)
@Getter
@AllArgsConstructor
//api에서 값을 꺼내서 db 에 저장하기 위한 (화면에 표시할 내용이 꼭 담겨있어야 함)
//값들이 대문자인 이유 api 에 맞춰서 바로 쓰기 위해, JS에서 가공 없이 바로 사용 가능
public class HospitalDto {
    private String BIZPLC_NM; //병원 이름
    private String ROAD_NM_ADDR; // 도로명 주소
    private String ROAD_NM_ZIP; // 우편번호
    private String TELNO; // 전화번호
    private String SALS_STTS_NM; //영업상태
    private Double Lat;
    private Double Lng;

}
