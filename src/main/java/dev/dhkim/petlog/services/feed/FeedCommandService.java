package dev.dhkim.petlog.services.feed;

import dev.dhkim.petlog.entities.feed.FeedEntity;
import dev.dhkim.petlog.entities.feed.FeedMediaEntity;
import dev.dhkim.petlog.enums.feed.MediaType;
import dev.dhkim.petlog.enums.feed.Source;
import dev.dhkim.petlog.mappers.feed.FeedMapper;
import dev.dhkim.petlog.mappers.feed.FeedMediaMapper;
import dev.dhkim.petlog.results.CommonResult;
import dev.dhkim.petlog.results.Result;
import dev.dhkim.petlog.services.common.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedCommandService {

    private final FeedMapper feedMapper;
    private final FeedMediaMapper feedMediaMapper;
    private final FeedMediaService feedMediaService;
    private final FileStorageService fileStorageService;

    // 글 작성하기 눌렀을 때 피드 및 피드 미디어 추가
    @Transactional
    public Result createFeed(int userId,
                             List<MultipartFile> files,
                             List<String> types,
                             List<Integer> orders,
                             String title,
                             String description
    ) {
        System.out.println("피드 작성 서비스 실행됨");
        if (files == null || files.isEmpty()) return CommonResult.FAILURE;
        if (types == null || orders == null) return CommonResult.FAILURE;
        if (files.size() != types.size() || files.size() != orders.size()) return CommonResult.FAILURE;

        FeedEntity feed = new FeedEntity();
        feed.setUserId(userId);
        feed.setTitle(title);
        feed.setContent(description);
        feed.setLikeCount(0);
        feed.setCommentCount(0);
        feed.setCreatedAt(LocalDateTime.now());

        int feedInsertResult = feedMapper.insertFeed(feed);
        if (feedInsertResult != 1)
            throw new RuntimeException("피드 저장 실패");
        int feedId = feed.getId();

        List<String> createdPaths = new ArrayList<>(); // savePath + thumbnailPath(영상일 때)
        List<FeedMediaEntity> mediaList = new ArrayList<>();

        try {
            for (int i = 0; i < files.size(); i++) {
                MultipartFile file = files.get(i);
                String type = types.get(i);
                Integer order = orders.get(i);
                String savePath = fileStorageService.save(file, "feed");

                createdPaths.add(savePath);

                String thumbnailPath = "video".equalsIgnoreCase(type)
                        ? feedMediaService.generateThumbnail(savePath, createdPaths) // 내부에서 썸네일 경로도 createdPaths에 추가
                        : savePath;

                FeedMediaEntity media = new FeedMediaEntity();
                media.setFeedId(feedId);
                media.setMediaUrl(savePath);
                media.setThumbnailUrl(thumbnailPath);
                media.setMediaType(
                        "video".equalsIgnoreCase(type)
                                ? MediaType.VIDEO
                                : MediaType.IMAGE
                );
                media.setSortOrder(order);
                media.setSource(Source.USER_UPLOAD);

                mediaList.add(media);
            }
            // 3) DB 저장 (성공 개수 정확히 체크)
            int inserted = feedMediaMapper.insertFeedMediaList(mediaList);

            // mediaList.size() 만큼 들어갔는지 확인 (부분 성공을 실패로 취급)
            if (inserted != mediaList.size()) {
                // DB는 @Transactional로 롤백되지만, 파일은 수동 삭제 필요
                feedMediaService.deleteCreatedFilesQuietly(createdPaths);
                throw new RuntimeException("미디어 저장 실패");
            }

            return CommonResult.SUCCESS;

        } catch (RuntimeException e) {
            // 예외 나면 DB 롤백 + 파일 수동 삭제
            feedMediaService.deleteCreatedFilesQuietly(createdPaths);
            throw e; // 트랜잭션 롤백 유지
        }
    }
}
