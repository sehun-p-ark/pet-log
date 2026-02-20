package dev.dhkim.petlog.mappers.cs;

import dev.dhkim.petlog.entities.cs.InquiryEntity;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface InquiryMapper {


    void insertInquiry(InquiryEntity inquiry);

    List<InquiryEntity> selectByUserId(Integer userId);

    InquiryEntity selectById(Integer inquiryId);

    void deleteById(Integer inquiryId);
}
