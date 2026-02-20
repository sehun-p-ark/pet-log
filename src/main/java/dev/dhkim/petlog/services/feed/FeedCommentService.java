package dev.dhkim.petlog.services.feed;

import dev.dhkim.petlog.dto.feed.FeedCommentDto;
import dev.dhkim.petlog.entities.feed.FeedCommentEntity;
import dev.dhkim.petlog.mappers.feed.FeedCommentMapper;
import dev.dhkim.petlog.mappers.feed.FeedMapper;
import dev.dhkim.petlog.utils.feed.TimeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FeedCommentService {

    private final FeedMapper feedMapper;
    private final FeedCommentMapper feedCommentMapper;

    // 댓글 대댓글 관계 설정해주기
    public List<FeedCommentDto> buildCommentTree(List<FeedCommentDto> flatList) {
        Map<Integer, FeedCommentDto> commentMap = new HashMap<>();
        List<FeedCommentDto> result = new ArrayList<>();

        // 모든 댓글을 map에 저장하기
        for (FeedCommentDto comment : flatList) {
            comment.setReplies(new ArrayList<>()); // replies 초기화
            commentMap.put(comment.getCommentId(), comment);
        }

        for (FeedCommentDto comment : flatList) {
            Integer parentId = comment.getParentCommentId();

            if (parentId == null) { // 부모 댓글이면
                result.add(comment); // 추가
            } else { // 자식 댓글이면
                FeedCommentDto parent = commentMap.get(parentId); // 자식이 가지고 있는 parentId에 해당하는 부모를 찾음
                if (parent != null) {
                    parent.getReplies().add(comment); // 해당 부모의 replies에 자식으로 추가
                }
            }
        }
        return result; // 자식을 포함한 부모 댓글 리스트 리턴
    }

    // 댓글 작성
    @Transactional
    public FeedCommentDto createComment(int feedId,
                                        int userId,
                                        String content) {
        // 1. feed 존재 여부 확인
        if (!feedMapper.existsById(feedId)) {
            throw new RuntimeException("존재하지 않는 피드");
        }

        FeedCommentEntity comment = FeedCommentEntity.builder()
                .feedId(feedId)
                .userId(userId)
                .content(content)
                .parentCommentId(null)
                .build();

        // 2. 댓글 insert
        feedCommentMapper.insertComment(comment);
        // 댓글 개수 +1
        feedMapper.increaseCommentCount(feedId, 1);
        // 작성한 댓글 반환
        FeedCommentDto dbDto = feedCommentMapper.selectById(comment.getId());
        dbDto.setTimeAgo(TimeUtil.getTimeAgo(dbDto.getCreatedAt()));
        return dbDto;
    }

    // 대댓글 작성
    @Transactional
    public FeedCommentDto createReply(int feedId,
                                      int parentCommentId,
                                      int userId,
                                      String content) {

        // 1. 부모 댓글 존재 여부 확인
        FeedCommentEntity parent = feedCommentMapper.selectEntityById(parentCommentId);

        if (parent == null) {
            throw new IllegalArgumentException("부모 댓글이 존재하지 않습니다.");
        }
        if (parent.getParentCommentId() != null) {
            throw new IllegalArgumentException("대댓글에는 답글을 달 수 없습니다.");
        }
        if (parent.getFeedId() != feedId) {
            throw new IllegalArgumentException("잘못된 요청입니다.");
        }

        FeedCommentEntity comment = FeedCommentEntity.builder()
                .feedId(feedId)
                .userId(userId)
                .content(content)
                .parentCommentId(parentCommentId)
                .build();

        // 2. insert
        feedCommentMapper.insertComment(comment);
        // 댓글 개수 +1
        feedMapper.increaseCommentCount(feedId, 1);
        // 작성한 댓글 반환
        FeedCommentDto dbDto = feedCommentMapper.selectById(comment.getId());
        dbDto.setTimeAgo(TimeUtil.getTimeAgo(dbDto.getCreatedAt()));
        return dbDto;
    }

    // 댓글 삭제
    @Transactional
    public void deleteComment(int feedId,
                              int commentId,
                              int loginUserId) {

        FeedCommentEntity comment = feedCommentMapper.selectEntityById(commentId);

        if (comment == null) {
            throw new IllegalArgumentException("댓글이 존재하지 않습니다.");
        }
        if (comment.getFeedId() != feedId) {
            throw new IllegalArgumentException("잘못된 요청입니다.");
        }
        if (comment.getUserId() != loginUserId) {
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }
        // 부모 + 자식 댓글 개수 계산
        int deleteCount = feedCommentMapper.countWithChildren(commentId);
        // 댓글 삭제
        feedCommentMapper.deleteById(commentId);
        // 댓글 개수 -deleteCount
        feedMapper.decreaseCommentCount(feedId, deleteCount);
    }
}
