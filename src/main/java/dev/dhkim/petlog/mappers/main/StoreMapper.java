package dev.dhkim.petlog.mappers.main;

import dev.dhkim.petlog.entities.user.StoreEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface StoreMapper {

    // 좌표가 없는 장소 조회
    List<StoreEntity> findStoresWithoutCoords();

    // 위도/경도 업데이트
    void updateStoreLatLng(Map<String, ? extends Number> params);

    // 카테고리별 스토어 조회 (XML에서 정의)
    List<StoreEntity> selectStoresByCategory(@Param("category") String category);

    // 전체 스토어 조회 (XML에서 정의)
    List<StoreEntity> selectAllStores();

    /*// 외부 API store 조회
    StoreEntity findByExternalTypeAndExternalId(
            @Param("externalType") String externalType,
            @Param("externalId") String externalId
    );

    // 외부 API store 등록
    void insertExternalStore(StoreEntity store);
    StoreEntity selectById(@Param("storeId") Long storeId);*/
}
