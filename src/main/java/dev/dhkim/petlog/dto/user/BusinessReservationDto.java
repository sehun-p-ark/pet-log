package dev.dhkim.petlog.dto.user;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class BusinessReservationDto {
    private int reservationId;
    private int storeId;
    private String storeName;       // 가게명
    private String category;        // 업종 카테고리
    private boolean canceled;          // 예약상태 (canceled 등)

    private LocalDate reservationDate;
    private LocalTime reservationTime;
    private String reserverName;    // 예약자 실명
    private String reserverPhone;   // 예약자 전화번호
    private String requestText;     // 요청사항
}
