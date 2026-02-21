package dev.dhkim.petlog.mappers.main;

import dev.dhkim.petlog.dto.user.PetDto;
import dev.dhkim.petlog.entities.user.AddressEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FriendMapper {

    List<PetDto> selectFriendsByUserId(@Param("userId") Integer userId);
    AddressEntity findDefaultByUserId(@Param("userId") Integer userId);
    //위치반경 친구 가지고 오기
    List<PetDto> selectNearbyFriends(
            @Param("userId") Integer userId,
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusKm") double radiusKm
    );
    void insertAddress(AddressEntity address);
    void updateAddress(AddressEntity address);
    void updateAddressLatLng(@Param("addressId") int addressId,
                             @Param("lat") double lat,
                             @Param("lng") double lng);

    // ✅ @Param 필수, XML #{excludeUserId}와 매칭
    List<AddressEntity> selectAllOtherUsersAddresses(@Param("excludeUserId") Integer currentUserId);
}
