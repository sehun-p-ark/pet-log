package dev.dhkim.petlog.mappers.main;

import dev.dhkim.petlog.entities.main.HospitalEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface HospitalMapper {
   //전체 조회
    List<HospitalEntity> findAll();

    // 중복 체크 , 공공데이터는 중복삽입 방지 필수
    boolean existsByManageNo(String manageNo);

    // 저장 (단건)
    void insertHospital(HospitalEntity hospital);


    // 좌표값이 NULL 또는 0으로 들어가 있는 병원 조회 zerolat,zerolng 위도 경도에 0 값이 들어갔는지 확인하기 위한
    // 쿼리 조건용 변수 엔티티랑은 상관 없음
    List<HospitalEntity> findInvalidCoords(
            @Param("zeroLat") double zeroLat,
            @Param("zeroLng") double zeroLng
    );

    // 위경도 업데이트
    void updateLatLng(
            @Param("id") int id,
            @Param("lat") double lat,
            @Param("lng") double lng
    );
      // 테스트용 삭제코드
    void deleteAllHospitals();

}

