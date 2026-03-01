package dev.dhkim.petlog.services.feed;

import dev.dhkim.petlog.dto.feed.FeedDto;
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
                             String title,
                             String description,
                             List<MultipartFile> files,
                             List<Integer> newOrders) {

        if (files == null || files.isEmpty()) return CommonResult.FAILURE;
        if (newOrders == null || files.size() != newOrders.size()) return CommonResult.FAILURE;
        if (title == null || title.isBlank() || title.length() > 50) return CommonResult.FAILURE;
        if (description == null || description.isBlank() || description.length() > 1000) return CommonResult.FAILURE;

        FeedEntity feed = new FeedEntity();
        feed.setUserId(userId);
        feed.setTitle(title);
        feed.setContent(description);
        feed.setLikeCount(0);
        feed.setCommentCount(0);
        feed.setCreatedAt(LocalDateTime.now());

        int insertedFeed = feedMapper.insertFeed(feed);
        if (insertedFeed != 1) {
            throw new RuntimeException("피드 저장 실패");
        }
        int feedId = feed.getId();

        List<String> createdPaths = new ArrayList<>();

        try {
            List<FeedMediaEntity> mediaList =
                    buildMediaEntities(feedId, files, newOrders, createdPaths);

            int insertedMedia = feedMediaMapper.insertFeedMediaList(mediaList);
            if (insertedMedia != mediaList.size()) {
                feedMediaService.deleteCreatedFilesQuietly(createdPaths);
                throw new RuntimeException("미디어 저장 실패");
            }

            return CommonResult.SUCCESS;

        } catch (RuntimeException e) {
            feedMediaService.deleteCreatedFilesQuietly(createdPaths);
            throw e;
        }
    }

    // 피드 업데이트
    @Transactional
    public Result updateFeed(int feedId,
                             int userId,
                             String title,
                             String description,
                             List<MultipartFile> files,
                             List<Integer> newOrders,
                             List<Integer> keepMediaIds,
                             List<Integer> keepOrders) {

        FeedDto feed = feedMapper.selectFeedById(feedId);
        if (feed == null || feed.getUserId() != userId) {
            return CommonResult.FAILURE;
        }

        if (title == null || title.isBlank()) return CommonResult.FAILURE;
        if (description == null || description.isBlank()) return CommonResult.FAILURE;

        // 기본 정보 수정
        feedMapper.updateFeed(feedId, title, description);

        // 기존 미디어 삭제 정리
        if (keepMediaIds == null) keepMediaIds = List.of();
        feedMediaMapper.deleteNotIn(feedId, keepMediaIds);

        // 기존 미디어 sort_order 업데이트
        if (!keepMediaIds.isEmpty()) {
            if (keepOrders == null || keepOrders.size() != keepMediaIds.size()) {
                return CommonResult.FAILURE;
            }

            List<FeedMediaEntity> updates = new ArrayList<>();
            for (int i = 0; i < keepMediaIds.size(); i++) {
                FeedMediaEntity m = new FeedMediaEntity();
                m.setId(keepMediaIds.get(i));      // feed_media.id
                m.setSortOrder(keepOrders.get(i)); // 최종 순서
                updates.add(m);
            }
            // ※ 아래 mapper 필요: updateSortOrders
            int updated = feedMediaMapper.updateSortOrders(updates);
            if (updated != updates.size()) {
                throw new RuntimeException("기존 미디어 순서 업데이트 실패");
            }
        }

        // 신규 파일 insert (썸네일 포함)
        if (files == null || files.isEmpty()) {
            return CommonResult.SUCCESS;
        }
        if (newOrders == null || newOrders.size() != files.size()) {
            return CommonResult.FAILURE;
        }

        List<String> createdPaths = new ArrayList<>();
        try {
            List<FeedMediaEntity> newMediaList =
                    buildMediaEntities(feedId, files, newOrders, createdPaths);

            int insertedMedia = feedMediaMapper.insertFeedMediaList(newMediaList);
            if (insertedMedia != newMediaList.size()) {
                feedMediaService.deleteCreatedFilesQuietly(createdPaths);
                throw new RuntimeException("신규 미디어 저장 실패");
            }

            return CommonResult.SUCCESS;

        } catch (RuntimeException e) {
            feedMediaService.deleteCreatedFilesQuietly(createdPaths);
            throw e;
        }
    }

    // 피드 삭제
    public Result deleteFeed(int feedId, int userId) {
        FeedDto feed = feedMapper.selectFeedById(feedId);
        if (feed == null) {
            return CommonResult.FAILURE;
        }
        if(feed.getUserId() != userId) {
            return CommonResult.FAILURE;
        }

        return feedMapper.deleteFeed(feedId) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    private List<FeedMediaEntity> buildMediaEntities(
            int feedId,
            List<MultipartFile> files,
            List<Integer> orders,
            List<String> createdPaths
    ) {

        List<FeedMediaEntity> mediaList = new ArrayList<>();

        for (int i = 0; i < files.size(); i++) {

            MultipartFile file = files.get(i);
            Integer order = orders.get(i);

            String contentType = file.getContentType();
            if (contentType == null) {
                throw new RuntimeException("파일 타입을 확인할 수 없습니다.");
            }

            MediaType mediaType = contentType.startsWith("image")
                    ? MediaType.IMAGE
                    : MediaType.VIDEO;

            String savePath = fileStorageService.save(file, "feed");
            createdPaths.add(savePath);

            String thumbnailPath = mediaType == MediaType.VIDEO
                    ? feedMediaService.generateThumbnail(savePath, createdPaths)
                    : savePath;

            FeedMediaEntity media = new FeedMediaEntity();
            media.setFeedId(feedId);
            media.setMediaUrl(savePath);
            media.setThumbnailUrl(thumbnailPath);
            media.setMediaType(mediaType);
            media.setSortOrder(order);
            media.setSource(Source.USER_UPLOAD);

            mediaList.add(media);
        }

        return mediaList;
    }
}
