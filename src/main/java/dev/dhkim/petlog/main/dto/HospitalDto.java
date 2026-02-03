package dev.dhkim.petlog.main.dto;

import lombok.Getter;
//프론트랑 서버랑 연결해주는 역할
@Getter
//api에서 값을 꺼내서 db 에 저장하기 위한 dto
public class HospitalDto {
    private String BIZPLC_NM;
    private String ROAD_NM_ADDR;
    private String CRD_INFO_X;
    private String CRD_INFO_Y;
    private String TELNO;
    private String SALS_STTS_NM;
    private String ROAD_NM_ZIP;
}
