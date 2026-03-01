package dev.dhkim.petlog.services.feed;

import dev.dhkim.petlog.entities.feed.FeedEntity;
import dev.dhkim.petlog.entities.feed.FeedMediaEntity;
import dev.dhkim.petlog.enums.feed.MediaType;
import dev.dhkim.petlog.enums.feed.Source;
import dev.dhkim.petlog.mappers.feed.FeedMapper;
import dev.dhkim.petlog.mappers.feed.FeedMediaMapper;
import dev.dhkim.petlog.utils.feed.DummyTextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class FeedDummyService {

    private final AnimalImageService animalImageService;
    private final DummyTextUtil dummyTextUtil;
    private final FeedMapper feedMapper;
    private final FeedMediaMapper feedMediaMapper;

    private final Random random = new Random();

    @Transactional
    public void generateDummyFeeds(int count) {

        for (int i = 0; i < count; i++) {
            // 피드 기본 정보 생성
            FeedEntity feed = new FeedEntity();
            feed.setUserId(random.nextInt(5 + 1) + 1); // (최대값 - 최소값 + 1) + 최소값;
            feed.setTitle(dummyTextUtil.randomTitle()); // 설정 값 중 하나
            feed.setContent(dummyTextUtil.randomContent()); // 설정 값 중 하나
            feed.setLikeCount(random.nextInt(200)); // 좋아요 수 0~200 중 하나
            feed.setCommentCount(0); // 댓글 수 0
            feed.setCreatedAt(LocalDateTime.now()); // 생성 시간

            feedMapper.insertFeed(feed); // Feed 생성

            // DOG or CAT 랜덤 선택
            Source source = random.nextBoolean() ? Source.DOG_API : Source.CAT_API;

            // 이미지 1~3개 가져오기
            int imageCount = random.nextInt(3) + 1;
            List<String> imageUrls = animalImageService.getRandomImages(source, imageCount);

            // FeedMediaEntity 생성
            List<FeedMediaEntity> mediaList = new ArrayList<>();

            int order = 0;
            for (String url : imageUrls) {
                FeedMediaEntity media = new FeedMediaEntity();
                media.setFeedId(feed.getId());
                media.setMediaUrl(url);
                media.setThumbnailUrl(url);
                media.setMediaType(MediaType.IMAGE);
                media.setSortOrder(order++);
                media.setSource(source);

                mediaList.add(media);
            }

            // DB 저장
            if (!mediaList.isEmpty()) {
                feedMediaMapper.insertFeedMediaList(mediaList);
            }
        }
    }
}
