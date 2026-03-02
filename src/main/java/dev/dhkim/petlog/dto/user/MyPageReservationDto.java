package dev.dhkim.petlog.dto.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MyPageReservationDto {
    // 예약정보
    private int reservationId;
    private LocalDate reservationDate;
    private LocalTime reservationTime;
    private String requestText;
    private boolean canceled;

    // 가게정보
    private int storeId;
    private String storeName;
    private String addressPrimary;
    private String addressSecondary;
    private String storePhone;
    private String category;
}
