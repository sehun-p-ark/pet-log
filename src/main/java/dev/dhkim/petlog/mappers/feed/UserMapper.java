package dev.dhkim.petlog.mappers.feed;

import dev.dhkim.petlog.dto.feed.ProfileDto;
import dev.dhkim.petlog.entities.user.UserEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    // ID로 현재 유저 정보 가져오기
    ProfileDto selectProfileById(int userId);

    // 닉네임으로 작성한 게시글, 팔로워, 팔로우 가져오기
    ProfileDto selectProfileByNickname(String nickname);

    // 현재 팔로우 상태 확인하기
    boolean selectIsFollowing(@Param("userId") int userId,
                              @Param("targetId") int targetId);
    // 팔로우 취소
    int deleteFollow(@Param("userId") int userId,
                     @Param("targetId") int targetId);
    // 팔로우
    int insertFollow(@Param("userId") int userId,
                     @Param("targetId") int targetId);

    // 팔로잉 +1
    int increaseFollowing(int userId);
    // 팔로잉 -1
    int decreaseFollowing(int userId);
    // 팔로워 +1
    int increaseFollowers(int userId);
    // 팔로워 -1
    int decreaseFollowers(int userId);

    // 팔로워 수 조회
    int selectFollowerCount(int userId);
    // 팔로잉 수 조회
    int selectFollowingCount(int userId);
}
