package dev.dhkim.petlog.mappers.main;

import dev.dhkim.petlog.entities.user.AddressEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AddressMapper {
    //해당 유저의 기본 주소 1건 조회
    AddressEntity findDefaultByUserId(@Param("userId") Integer userId);
    void insertAddress(AddressEntity address);
    //위도경도 업데이트
    void updateAddressLatLng(@Param("addressId") int addressId,
                             @Param("lat") double lat,
                             @Param("lng") double lng);

    //어드레스 타입이 map 인 애들만
    List<AddressEntity> selectAllOtherUsersMapAddresses(
            @Param("excludeUserId") Integer currentUserId
    );
    // 대표주소 변경할 때 기존 전체 해제
    void updateAllDefaultFalse(@Param("userId") int userId);

    // 선택한 주소를 대표로 설정
    void updateDefaultByAddressId(@Param("addressId") int addressId);


}
