package dev.dhkim.petlog.services.main;

import dev.dhkim.petlog.mappers.main.FollowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowMapper followMapper;

    /**
     * 팔로우 토글
     * true  -> 팔로우 상태
     * false -> 언팔로우 상태
     */
    @Transactional
    public boolean toggleFollow(Integer myUserId, Integer targetUserId) {

        int exists = followMapper.existsFollow(myUserId, targetUserId);

        if (exists > 0) {
            followMapper.deleteFollow(myUserId, targetUserId);
            return false;   // 언팔로우
        } else {
            followMapper.insertFollow(myUserId, targetUserId);
            return true;    // 팔로우
        }
    }
}
