package dev.dhkim.petlog.mappers.main;

import dev.dhkim.petlog.entities.user.StoreEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface StoreMapper {

    // 기본 등록 (일반 유저용)
    void insert(StoreEntity storeEntity);

    // API 데이터 캐싱용 등록 (useGeneratedKeys 사용)
    void insertApiStore(StoreEntity storeEntity);

    // 주소와 이름으로 기존 스토어 ID 조회 (중복 방지용)
    Integer findIdByAddressAndName(@Param("address") String address, @Param("placeName") String placeName);

    // 단일 스토어 조회
    StoreEntity selectById(@Param("storeId") Integer storeId);

    // 카테고리별 조회
    List<StoreEntity> selectStoresByCategory(@Param("category") String category);

    // 전체 조회
    List<StoreEntity> selectAllStores();

    // 좌표 업데이트
    void updateStoreLatLng(@Param("storeId") Integer storeId,
                           @Param("lat") Double lat,
                           @Param("lng") Double lng);

    // 좌표가 없는 스토어 목록 조회 (스케줄러나 관리용)
    List<StoreEntity> findStoresWithoutCoords();

    int updateStore(StoreEntity entity);
}