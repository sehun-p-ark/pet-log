package dev.dhkim.petlog.services.feed;

import dev.dhkim.petlog.mappers.feed.FeedLikeMapper;
import dev.dhkim.petlog.mappers.feed.FeedMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FeedLikeService {

    private final FeedMapper feedMapper;
    private final FeedLikeMapper feedLikeMapper;

    @Transactional
    public Map<String, Object> toggleLike(int feedId, int userId) {

        Map<String, Object> result = new HashMap<>();
        boolean liked;

        try {
            feedLikeMapper.insert(feedId, userId);
            feedMapper.increaseLikeCount(feedId);
            liked = true;
        } catch (DuplicateKeyException e) { // 이미 좋아요 되어있음 (키 중복)
            int deleted = feedLikeMapper.delete(feedId, userId);
            if (deleted != 1) {
                throw new RuntimeException("좋아요 취소 실패");
            }
            feedMapper.decreaseLikeCount(feedId);
            liked = false;
        }

        int likeCount = feedMapper.selectLikeCount(feedId);

        result.put("liked", liked);
        result.put("likeCount", likeCount);

        return result;
    }
}
