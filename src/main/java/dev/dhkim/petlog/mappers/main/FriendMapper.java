package dev.dhkim.petlog.mappers.main;

import dev.dhkim.petlog.dto.main.FriendListDto;
import dev.dhkim.petlog.dto.user.PetDto;
import dev.dhkim.petlog.entities.user.AddressEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FriendMapper {

    List<PetDto> selectFriendsByUserId(@Param("userId") Integer userId);
    //해당 유저의 기본 주소 1건 조회
    AddressEntity findDefaultByUserId(@Param("userId") Integer userId);
    //위치반경 친구 가지고 오기
    List<PetDto> selectNearbyFriends(
            @Param("userId") Integer userId,
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusKm") double radiusKm
    );
    void insertAddress(AddressEntity address);
    void updateAddressLatLng(@Param("addressId") int addressId,
                             @Param("lat") double lat,
                             @Param("lng") double lng);

    //어드레스 타입이 map 인 애들만
    List<AddressEntity> selectAllOtherUsersMapAddresses(
            @Param("excludeUserId") Integer currentUserId
    );

    List<FriendListDto> selectNearbyUsers(Integer userId, double myLat, double myLng, double radiusKm);
}
