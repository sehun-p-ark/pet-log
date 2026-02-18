package dev.dhkim.petlog.services.feed;

import dev.dhkim.petlog.mappers.feed.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class FeedFollowService {
    private final UserMapper userMapper;

    @Transactional
    public boolean toggleFollow(int userId, int targetUserId) {
        boolean exists = userMapper.selectIsFollowing(userId, targetUserId);

        if (exists) { // 현재 팔로우 중이라면
            userMapper.deleteFollow(userId, targetUserId);
            userMapper.decreaseFollowing(userId);
            userMapper.decreaseFollowers(targetUserId);
            return false;
        } else {
            userMapper.insertFollow(userId, targetUserId);
            userMapper.increaseFollowing(userId);
            userMapper.increaseFollowers(targetUserId);
            return true;
        }
    }

    public Map<String, Integer> getFollowCount(int userId, int targetUserId) {
        int followerCount = userMapper.selectFollowerCount(targetUserId);
        int followingCount = userMapper.selectFollowingCount(userId);
        return Map.of("followerCount", followerCount,
                "followingCount", followingCount);
    }
}
