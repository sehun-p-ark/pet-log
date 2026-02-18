package dev.dhkim.petlog.services.feed;

import dev.dhkim.petlog.dto.feed.ProfileDto;
import dev.dhkim.petlog.mappers.feed.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FeedProfileService {

    private final UserMapper userMapper;

    // 프로필 가져오기
    public ProfileDto getProfile(Integer userId) {
        return userMapper.selectProfileById(userId);
    }

    // 프로필 페이지 띄우기
    public ProfileDto getProfileView(String nickname, Integer userId) {
        ProfileDto profile = userMapper.selectProfileByNickname(nickname);
        if (profile == null) {
            return null;
        }
        boolean isMine = false;
        boolean isFollowing = false;

        if (userId != null) {
            isMine = profile.getUserId() == userId;

            if (!isMine) {
                isFollowing = userMapper.selectIsFollowing(userId, profile.getUserId());
            }
        }

        profile.setMine(isMine);
        profile.setFollowing(isFollowing);
        return profile;
    }
}
