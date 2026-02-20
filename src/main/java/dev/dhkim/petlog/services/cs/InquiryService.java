package dev.dhkim.petlog.services.cs;

import dev.dhkim.petlog.dto.cs.InquiryDto;
import dev.dhkim.petlog.entities.cs.InquiryEntity;
import dev.dhkim.petlog.enums.cs.InquiryStatus;
import dev.dhkim.petlog.mappers.cs.InquiryMapper;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryMapper inquiryMapper;

    public void writeInquiry(int userId, InquiryDto dto) {

        InquiryEntity inquiry = new InquiryEntity();

        inquiry.setUserId(userId);
        inquiry.setTitle(dto.getTitle());
        inquiry.setContent(dto.getContent());
        inquiry.setStatus(InquiryStatus.WAITING);
        inquiry.setCreatedAt(LocalDateTime.now());

        inquiryMapper.insertInquiry(inquiry);
    }

    public List<InquiryEntity> findByUserId(Integer userId) {
        if (userId == null) return List.of();  // null이면 빈 리스트 반환
        return inquiryMapper.selectByUserId(userId);
    }

    public void deleteInquiry(Integer inquiryId, Integer sessionUserId) {
        if (inquiryId == null) return; // null 방지

        InquiryEntity inquiry = inquiryMapper.selectById(inquiryId);

        if (inquiry == null) {
            System.out.println("삭제할 inquiry가 없음 id=" + inquiryId);
            return;
        }

        // 테스트용: 세션 유저 상관없이 삭제
        inquiryMapper.deleteById(inquiryId);
        System.out.println("삭제 완료 id=" + inquiryId);
    }




}

