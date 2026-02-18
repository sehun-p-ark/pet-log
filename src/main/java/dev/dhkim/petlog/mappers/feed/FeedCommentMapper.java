package dev.dhkim.petlog.mappers.feed;

import dev.dhkim.petlog.dto.feed.FeedCommentDto;
import dev.dhkim.petlog.entities.feed.FeedCommentEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FeedCommentMapper {
    List<FeedCommentDto> selectCommentById (@Param("feedId") int feedId);
}
