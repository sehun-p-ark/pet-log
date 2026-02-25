
package dev.dhkim.petlog.services.cs;
import dev.dhkim.petlog.dto.cs.InquiryDto;
import dev.dhkim.petlog.entities.cs.InquiryEntity;
import dev.dhkim.petlog.enums.cs.InquiryStatus;
import dev.dhkim.petlog.mappers.cs.InquiryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InquiryService {
    private final InquiryMapper inquiryMapper;

    // [문의 작성]
    public void writeInquiry(int userId, InquiryDto dto) {
        if (dto == null) throw new IllegalArgumentException("문의 데이터가 없습니다.");

        if (dto.getTitle() == null || dto.getTitle().trim().length() < 5) {
            throw new IllegalArgumentException("제목이 너무 짧습니다.");
        }

        InquiryEntity inquiry = new InquiryEntity();
        inquiry.setUserId(userId);
        inquiry.setTitle(dto.getTitle());
        inquiry.setContent(dto.getContent());
        inquiry.setStatus(InquiryStatus.WAITING);
        inquiry.setCreatedAt(LocalDateTime.now());

        inquiryMapper.insertInquiry(inquiry);
    }

    // [일반 유저용] 본인 글만 조회
    public List<InquiryEntity> getInquiriesByUserId(Integer userId) {
        if (userId == null) return List.of();
        return inquiryMapper.selectByUserId(userId);
    }

    // [관리자용] 모든 유저 글 조회
    public List<InquiryEntity> getAllInquiries() {
        return inquiryMapper.selectAllInquiries();
    }

    // [답변 등록]
    @Transactional
    public boolean replyInquiry(int id, String answer) {
        // DB에서 answer 업데이트 및 status를 'COMPLETED'로 변경하는 쿼리 호출
        return this.inquiryMapper.updateInquiryAnswer(id, answer) > 0;
    }

    // [삭제]
    public void deleteInquiry(Integer inquiryId) {
        if (inquiryId != null) {
            inquiryMapper.deleteById(inquiryId);
        }
    }
}