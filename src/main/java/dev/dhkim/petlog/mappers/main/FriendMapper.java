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

    //위치반경 친구 가지고 오기
    List<PetDto> selectNearbyFriends(
            @Param("userId") Integer userId,
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusKm") double radiusKm
    );


    List<FriendListDto> selectNearbyUsers(Integer userId, double myLat, double myLng, double radiusKm);
}
