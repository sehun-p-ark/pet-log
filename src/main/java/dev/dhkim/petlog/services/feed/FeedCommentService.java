package dev.dhkim.petlog.services.feed;

import dev.dhkim.petlog.dto.feed.FeedCommentDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FeedCommentService {

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
}
