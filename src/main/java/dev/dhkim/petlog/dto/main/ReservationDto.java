package dev.dhkim.petlog.dto.main;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ReservationDto {
    private Integer reservationId;   // auto_increment
    private Integer userId;          // NOT NULL
    private Integer storeId;         // NULL 가능
    private LocalDate reservationDate;
    private LocalTime reservationTime;
    private String requestText;
    private String paymentMethod = "OFFLINE"; // 기본값

    // --- API 장소 예약을 위해 추가하는 임시 필드 ---
    private String placeName;   // 프론트에서 받은 장소 이름 (ex: OO병원)
    private String address;     // 프론트에서 받은 장소 주소
    private String category;    // 프론트에서 받은 카테고리 (ex: hospital, salon)
    // 이 필드들은 js 랑 이름이 같으면 됨 db 랑 달라도 상관 없음


/*    @Override
    public String toString() {
        return "ReservationDto{" +
                "reservationId=" + reservationId +
                ", userId=" + userId +
                ", storeId=" + storeId +
                ", reservationDate='" + reservationDate + '\'' +
                ", reservationTime='" + reservationTime + '\'' +
                ", requestText='" + requestText + '\'' +
                ", paymentMethod='" + paymentMethod + '\'' +
                '}';
    }*/
}
