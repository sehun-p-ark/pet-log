package dev.dhkim.petlog.mappers.main;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface FollowMapper {

    // 팔로우 존재 여부
    int existsFollow(
            @Param("followingUserId") Integer myUserId,
            @Param("followedUserId") Integer targetUserId
    );

    // 팔로우 추가
    void insertFollow(
            @Param("followingUserId") Integer myUserId,
            @Param("followedUserId") Integer targetUserId
    );

    // 언팔로우
    void deleteFollow(
            @Param("followingUserId") Integer myUserId,
            @Param("followedUserId") Integer targetUserId
    );
}
