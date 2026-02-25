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
        boolean exists = feedLikeMapper.existsFeedLike(feedId, userId);
        boolean liked;
        if(exists) {
            feedLikeMapper.delete(feedId, userId);
            feedMapper.decreaseLikeCount(feedId);
            liked = false;
        } else {
            feedLikeMapper.insert(feedId, userId);
            feedMapper.increaseLikeCount(feedId);
            liked = true;
        }

        int likeCount = feedMapper.selectLikeCount(feedId);

        result.put("liked", liked);
        result.put("likeCount", likeCount);

        return result;
    }
}
